import { ParkingLot, CityName, INITIAL_PARKING_LOTS, DestinationCategory, PREDEFINED_DESTINATIONS, DEFAULT_DESTINATION_SEARCH_RADIUS_KM } from "../data/mockParkingData";

const STORAGE_ADMIN_LOTS_KEY = "findmyslot_v2_admin_parking_lots";

/**
 * Reusable Haversine distance calculation utility (in Kilometers).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Rounded to 1 decimal place
}

/**
 * Retrieves all admin-registered parking facilities stored in LocalStorage.
 */
export function getStoredAdminLots(): ParkingLot[] {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_LOTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse admin parking lots", e);
  }
  return [];
}

/**
 * Saves an admin parking lot to storage.
 */
export function saveAdminLot(lot: ParkingLot): void {
  const current = getStoredAdminLots();
  const updated = [lot, ...current.filter((l) => l.id !== lot.id)];
  localStorage.setItem(STORAGE_ADMIN_LOTS_KEY, JSON.stringify(updated));
}

/**
 * Soft-deletes a parking lot owned by an admin.
 * Sets isActive = false and status = "inactive".
 * Immediately removes it from driver search while preserving historical bookings.
 */
export function deleteAdminParkingLot(lotId: string, adminEmail: string): boolean {
  if (!adminEmail) return false;
  const adminLots = getStoredAdminLots();
  const target = adminLots.find((l) => l.id === lotId);
  if (!target) return false;

  if (target.ownerAdminEmail?.toLowerCase() !== adminEmail.trim().toLowerCase()) {
    console.error("Unauthorized parking lot deletion attempt");
    return false;
  }

  target.isActive = false;
  target.status = "inactive";
  saveAdminLot(target);
  return true;
}

/**
 * Returns all active parking lots (prototype + admin published).
 * Filters out soft-deleted/inactive lots.
 */
export function getAllParkingLots(includeInactive = false): ParkingLot[] {
  const adminLots = getStoredAdminLots();
  const combined = [...INITIAL_PARKING_LOTS, ...adminLots];

  if (includeInactive) {
    return combined;
  }

  return combined.filter(
    (l) => l.isActive !== false && l.status !== "inactive"
  );
}

/**
 * Multi-Destination Haversine Search with Result Deduplication:
 * 1. If destination query is empty: returns all active available parking lots in the selected city.
 * 2. If destination query is provided:
 *    - Finds ALL matching destinations in selected city (both name and category).
 *    - Calculates distance from each matching destination to active available parking lots in that city.
 *    - Assigns minimum distance (distanceKm) to each lot.
 *    - Deduplicates parking lots.
 *    - Filters within DEFAULT_DESTINATION_SEARCH_RADIUS_KM (10 km).
 *    - Sorts nearest-first.
 */
export function getParkingLotsByCityAndCategory(
  city: CityName,
  categoryOrQuery?: string
): (ParkingLot & { distanceKm?: number })[] {
  // Filter active, available lots in the selected city
  const cityActiveLots = getAllParkingLots().filter(
    (l) =>
      l.city.toLowerCase() === city.toLowerCase() &&
      l.isActive !== false &&
      l.status !== "inactive"
  );

  // If search query is empty, return all active city lots (without radius filtering)
  if (!categoryOrQuery || categoryOrQuery.trim() === "") {
    return cityActiveLots;
  }

  const query = categoryOrQuery.trim().toLowerCase();

  // Find ALL matching destinations in the selected city (case-insensitive partial match)
  const matchingDestinations = PREDEFINED_DESTINATIONS.filter(
    (d) =>
      d.city.toLowerCase() === city.toLowerCase() &&
      (d.name.toLowerCase().includes(query) ||
        d.category.toLowerCase().includes(query) ||
        d.categoryLabel.toLowerCase().includes(query))
  );

  // If no matching destination exists in this city, return empty array (triggers "No destinations found")
  if (matchingDestinations.length === 0) {
    return [];
  }

  // Calculate minimum Haversine distance for each lot across all matching destinations
  const lotDistanceMap = new Map<string, number>();

  cityActiveLots.forEach((lot) => {
    let minDistance = Infinity;
    matchingDestinations.forEach((dest) => {
      const dist = calculateHaversineDistanceKm(
        dest.latitude,
        dest.longitude,
        lot.latitude,
        lot.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
      }
    });

    if (minDistance <= DEFAULT_DESTINATION_SEARCH_RADIUS_KM) {
      lotDistanceMap.set(lot.id, minDistance);
    }
  });

  // Filter within radius, deduplicate, attach distanceKm, and sort nearest-first
  return cityActiveLots
    .filter((lot) => lotDistanceMap.has(lot.id))
    .map((lot) => ({
      ...lot,
      distanceKm: lotDistanceMap.get(lot.id),
      walkingDistanceMeters: Math.round((lotDistanceMap.get(lot.id) || 0.2) * 1000),
      walkingTimeMinutes: Math.max(1, Math.round(((lotDistanceMap.get(lot.id) || 0.2) * 1000) / 80)),
    }))
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
}

/**
 * Retrieves facilities owned strictly by adminEmail.
 * Include inactive lots for admin dashboard view if needed, or active only.
 */
export function getAdminFacilities(adminEmail?: string, includeInactive = true): ParkingLot[] {
  if (!adminEmail) return [];
  const normalized = adminEmail.trim().toLowerCase();
  const adminLots = getStoredAdminLots();
  return adminLots.filter(
    (l) =>
      l.source === "admin" &&
      l.ownerAdminEmail?.toLowerCase() === normalized &&
      (includeInactive || l.isActive !== false)
  );
}

/**
 * Registers a new parking facility for an admin.
 * Tags it with source = "admin" and ownerAdminEmail.
 */
export function registerAdminFacility(
  facilityData: Omit<
    ParkingLot,
    | "id"
    | "availableSlots"
    | "walkingDistanceMeters"
    | "walkingTimeMinutes"
    | "securityRating"
    | "latitude"
    | "longitude"
    | "source"
    | "status"
    | "categories"
    | "isActive"
  > & {
    categories?: DestinationCategory[];
  },
  adminEmail: string
): ParkingLot {
  const normalizedEmail = adminEmail.trim().toLowerCase();

  // Assign coordinates centered on selected city
  let lat = 17.3850;
  let lng = 78.4867;
  if (facilityData.city === "Bengaluru") {
    lat = 12.9716;
    lng = 77.5946;
  } else if (facilityData.city === "Chennai") {
    lat = 13.0827;
    lng = 80.2707;
  } else if (facilityData.city === "Mumbai") {
    lat = 19.0760;
    lng = 72.8777;
  } else if (facilityData.city === "Delhi") {
    lat = 28.6139;
    lng = 77.2090;
  }

  const newLot: ParkingLot = {
    ...facilityData,
    id: `lot-admin-${Date.now()}`,
    latitude: lat + (Math.random() * 0.02 - 0.01),
    longitude: lng + (Math.random() * 0.02 - 0.01),
    availableSlots: facilityData.totalSlots,
    walkingDistanceMeters: 100 + Math.floor(Math.random() * 200),
    walkingTimeMinutes: 2 + Math.floor(Math.random() * 2),
    securityRating: 4.8,
    categories: facilityData.categories || ["office", "landmark"],
    source: "admin",
    ownerAdminEmail: normalizedEmail,
    status: "active",
    isActive: true,
  };

  saveAdminLot(newLot);
  return newLot;
}

/**
 * Updates slot availability on a specific lot.
 */
export function updateSlotAvailability(lotId: string, delta: number): void {
  const allAdminLots = getStoredAdminLots();
  const targetAdminLot = allAdminLots.find((l) => l.id === lotId);

  if (targetAdminLot) {
    targetAdminLot.availableSlots = Math.max(
      0,
      Math.min(targetAdminLot.totalSlots, targetAdminLot.availableSlots + delta)
    );
    if (targetAdminLot.isActive !== false) {
      targetAdminLot.status = targetAdminLot.availableSlots === 0 ? "full" : "active";
    }
    saveAdminLot(targetAdminLot);
  }
}
