import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🚀 Creating parking slots...\n');

const [lots] = await connection.execute('SELECT id FROM parking_lots');

console.log(`Found ${lots.length} parking lots\n`);

let slotCount = 0;
const slotCounts = [150, 300, 200, 250, 180];
const statuses = ['available', 'occupied', 'reserved'];
const types = ['standard', 'compact', 'handicap', 'ev_charging'];

for (let lotIdx = 0; lotIdx < lots.length; lotIdx++) {
  const lot = lots[lotIdx];
  const totalSlots = slotCounts[lotIdx] || 200;
  
  console.log(`Creating ${totalSlots} slots for lot ${lot.id}...`);
  
  for (let i = 1; i <= totalSlots; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const lat = 28.5 + Math.random() * 0.5;
    const lng = 77.0 + Math.random() * 0.5;
    
    try {
      await connection.execute(
        `INSERT INTO parking_slots (lot_id, slot_number, status, type, latitude, longitude) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [lot.id, `LOT${lot.id}-${String(i).padStart(4, '0')}`, status, type, lat, lng]
      );
      slotCount++;
    } catch (e) {
      // Ignore duplicates
    }
  }
}

console.log(`\n✅ Created ${slotCount} parking slots\n`);

await connection.end();
