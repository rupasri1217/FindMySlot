import { CityName, SavedPlace } from "../data/mockParkingData";

export type UserRole = "user" | "admin";

export interface AuthAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  selectedCity?: CityName;
  phone?: string;
  createdAt?: string;
}

const STORAGE_SESSION_KEY = "findmyslot_user_session";
const STORAGE_ACCOUNTS_KEY = "findmyslot_registered_accounts";

/**
 * Retrieves the current logged-in session, or null if logged out.
 */
export function getCurrentSession(): AuthAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse user session", e);
  }
  return null;
}

/**
 * Saves current active session.
 */
export function setCurrentSession(user: AuthAccount): void {
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to set user session", e);
  }
}

/**
 * Clears active session on logout.
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (e) {
    console.error("Failed to clear session", e);
  }
}

/**
 * Retrieves all registered accounts.
 */
export function getRegisteredAccounts(): Record<string, AuthAccount> {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse accounts registry", e);
  }
  return {};
}

/**
 * Registers or logs in an account by email and role.
 */
export function registerOrLoginAccount(email: string, role: UserRole, name?: string): AuthAccount {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getRegisteredAccounts();
  
  let account = accounts[normalizedEmail];
  if (!account || account.role !== role) {
    const defaultName = name || (role === "admin" ? "Parking Lot Admin" : normalizedEmail.split("@")[0] || "Mobility Driver");
    account = {
      id: `${role}-${Date.now()}`,
      email: normalizedEmail,
      name: defaultName,
      role: role,
      selectedCity: undefined,
      createdAt: new Date().toISOString(),
    };
    accounts[normalizedEmail] = account;
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  }
  
  setCurrentSession(account);
  return account;
}

/**
 * User-isolated City Preference
 */
export function getUserSelectedCity(email?: string): CityName | null {
  if (!email) return null;
  try {
    const key = `findmyslot_user_city_${email.toLowerCase()}`;
    const stored = localStorage.getItem(key);
    return (stored as CityName) || null;
  } catch (e) {
    return null;
  }
}

export function setUserSelectedCity(email: string, city: CityName): void {
  if (!email) return;
  try {
    const key = `findmyslot_user_city_${email.toLowerCase()}`;
    localStorage.setItem(key, city);
    
    const current = getCurrentSession();
    if (current && current.email.toLowerCase() === email.toLowerCase()) {
      current.selectedCity = city;
      setCurrentSession(current);
    }
  } catch (e) {
    console.error("Failed to save city preference", e);
  }
}

/**
 * User-isolated Saved Places using parkingLotId as authoritative reference
 */
export function getUserSavedPlaces(userEmail?: string): SavedPlace[] {
  if (!userEmail) return [];
  try {
    const key = `findmyslot_saved_places_${userEmail.toLowerCase()}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse saved places", e);
  }
  return [];
}

/**
 * Saves a parking lot with a user-assigned custom name.
 * Prevents duplicate saves of the same parkingLotId for the same user.
 */
export function saveUserParkingLot(
  userEmail: string,
  parkingLotId: string,
  customName: string
): SavedPlace[] {
  if (!userEmail || !parkingLotId) return [];
  const normalizedEmail = userEmail.toLowerCase();
  const current = getUserSavedPlaces(normalizedEmail);

  // Check duplicate save
  const existing = current.find(p => p.parkingLotId === parkingLotId);
  if (existing) {
    existing.customName = customName || existing.customName;
    const key = `findmyslot_saved_places_${normalizedEmail}`;
    localStorage.setItem(key, JSON.stringify(current));
    return current;
  }

  const newSavedPlace: SavedPlace = {
    id: `sp-${Date.now()}`,
    userEmail: normalizedEmail,
    parkingLotId,
    customName: customName.trim() || "Saved Parking Spot",
    createdAt: new Date().toISOString(),
  };

  const updated = [newSavedPlace, ...current];
  const key = `findmyslot_saved_places_${normalizedEmail}`;
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

/**
 * Updates personal custom name for a saved place entry.
 */
export function updateUserSavedCustomName(
  userEmail: string,
  savedId: string,
  newCustomName: string
): SavedPlace[] {
  if (!userEmail || !savedId) return [];
  const normalizedEmail = userEmail.toLowerCase();
  const current = getUserSavedPlaces(normalizedEmail);
  
  const target = current.find(p => p.id === savedId);
  if (target) {
    target.customName = newCustomName.trim() || target.customName;
    const key = `findmyslot_saved_places_${normalizedEmail}`;
    localStorage.setItem(key, JSON.stringify(current));
  }
  return current;
}

/**
 * Removes a saved place entry.
 */
export function removeUserSavedPlace(userEmail: string, savedId: string): SavedPlace[] {
  if (!userEmail || !savedId) return [];
  const normalizedEmail = userEmail.toLowerCase();
  const current = getUserSavedPlaces(normalizedEmail);
  const updated = current.filter(p => p.id !== savedId);
  const key = `findmyslot_saved_places_${normalizedEmail}`;
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}
