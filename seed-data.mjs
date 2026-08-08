import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Dummy parking lots data
const parkingLots = [
  {
    name: 'Downtown Plaza Parking',
    description: 'Premium parking in downtown with 24/7 security',
    address: '123 Main Street, Downtown',
    latitude: 28.6139,
    longitude: 77.2090,
    totalSlots: 150,
    availableSlots: 45,
    pricePerHour: 50,
    operatingHours: JSON.stringify({ open: '06:00', close: '23:00' }),
    amenities: JSON.stringify(['24/7 Security', 'CCTV', 'EV Charging', 'Covered Parking']),
    isActive: true,
    createdBy: 1,
  },
  {
    name: 'Airport Terminal Parking',
    description: 'Convenient parking near airport terminals',
    address: '456 Airport Road',
    latitude: 28.5562,
    longitude: 77.0994,
    totalSlots: 300,
    availableSlots: 120,
    pricePerHour: 40,
    operatingHours: JSON.stringify({ open: '00:00', close: '23:59' }),
    amenities: JSON.stringify(['24/7 Service', 'Shuttle Service', 'Valet Parking']),
    isActive: true,
    createdBy: 1,
  },
  {
    name: 'Mall Central Parking',
    description: 'Shopping mall parking with direct mall access',
    address: '789 Shopping Center, Sector 5',
    latitude: 28.5244,
    longitude: 77.1855,
    totalSlots: 200,
    availableSlots: 85,
    pricePerHour: 30,
    operatingHours: JSON.stringify({ open: '08:00', close: '22:00' }),
    amenities: JSON.stringify(['Air Conditioned', 'Disabled Parking', 'EV Charging']),
    isActive: true,
    createdBy: 1,
  },
  {
    name: 'Business District Parking',
    description: 'Corporate parking for business professionals',
    address: '321 Corporate Avenue',
    latitude: 28.5355,
    longitude: 77.3910,
    totalSlots: 250,
    availableSlots: 60,
    pricePerHour: 60,
    operatingHours: JSON.stringify({ open: '06:00', close: '21:00' }),
    amenities: JSON.stringify(['Reserved Spots', 'Monthly Plans', 'Covered Parking']),
    isActive: true,
    createdBy: 1,
  },
  {
    name: 'Hospital Parking',
    description: 'Hospital parking with priority for emergency vehicles',
    address: '654 Medical Plaza',
    latitude: 28.5920,
    longitude: 77.2315,
    totalSlots: 180,
    availableSlots: 70,
    pricePerHour: 20,
    operatingHours: JSON.stringify({ open: '00:00', close: '23:59' }),
    amenities: JSON.stringify(['24/7 Access', 'Disabled Parking', 'Emergency Parking']),
    isActive: true,
    createdBy: 1,
  },
];

// Insert parking lots
for (const lot of parkingLots) {
  await connection.execute(
    `INSERT INTO parking_lots (name, description, address, latitude, longitude, total_slots, available_slots, price_per_hour, operating_hours, amenities, is_active, created_by) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [lot.name, lot.description, lot.address, lot.latitude, lot.longitude, lot.totalSlots, lot.availableSlots, lot.pricePerHour, lot.operatingHours, lot.amenities, lot.isActive, lot.createdBy]
  );
}

// Get all parking lots to insert slots
const [lots] = await connection.execute('SELECT id FROM parking_lots');

// Generate parking slots for each lot
for (const lot of lots) {
  const slotCount = [150, 300, 200, 250, 180][lots.indexOf(lot)];
  const statuses = ['available', 'occupied', 'reserved', 'maintenance'];
  
  for (let i = 1; i <= slotCount; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const type = ['standard', 'compact', 'handicap', 'ev_charging'][Math.floor(Math.random() * 4)];
    const lat = parseFloat(lot.latitude) + (Math.random() - 0.5) * 0.01;
    const lng = parseFloat(lot.longitude) + (Math.random() - 0.5) * 0.01;
    
    await connection.execute(
      `INSERT INTO parking_slots (lot_id, slot_number, status, type, latitude, longitude) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [lot.id, `${lot.id}-${i}`, status, type, lat, lng]
    );
  }
}

console.log('✅ Database seeded successfully!');
await connection.end();
