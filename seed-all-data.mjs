import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🚀 Starting comprehensive data seeding...\n');

// Get existing data
const [users] = await connection.execute('SELECT id FROM users LIMIT 5');
const [lots] = await connection.execute('SELECT id, price_per_hour FROM parking_lots');
const [slots] = await connection.execute('SELECT id, lot_id FROM parking_slots LIMIT 1000');

console.log(`✅ Found ${users.length} users, ${lots.length} lots, ${slots.length} slots\n`);

if (slots.length === 0) {
  console.log('⚠️ No slots found. Creating slots first...\n');
  const slotCounts = [150, 300, 200, 250, 180];
  const statuses = ['available', 'occupied', 'reserved'];
  const types = ['standard', 'compact', 'handicap', 'ev_charging'];
  
  for (let lotIdx = 0; lotIdx < lots.length; lotIdx++) {
    const lot = lots[lotIdx];
    const totalSlots = slotCounts[lotIdx] || 200;
    
    for (let i = 1; i <= Math.min(totalSlots, 50); i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      
      await connection.execute(
        `INSERT IGNORE INTO parking_slots (lot_id, slot_number, status, type, latitude, longitude) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [lot.id, `LOT${lot.id}-${i}`, status, type, 28.5 + Math.random() * 0.5, 77.0 + Math.random() * 0.5]
      );
    }
  }
  
  const [newSlots] = await connection.execute('SELECT id, lot_id FROM parking_slots LIMIT 1000');
  slots.splice(0, slots.length, ...newSlots);
  console.log(`✅ Created ${slots.length} slots\n`);
}

const userIds = users.map(u => u.id);
const bookingStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
const paymentStatuses = ['unpaid', 'paid', 'refunded', 'failed'];
const paymentMethods = ['credit_card', 'debit_card', 'upi', 'wallet'];

console.log('📅 Creating 300+ bookings...');
let bookingCount = 0;
for (let i = 0; i < 300; i++) {
  const userId = userIds[i % userIds.length];
  const slot = slots[i % slots.length];
  const lot = lots.find(l => l.id === slot.lot_id);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) - 30);
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 8) + 1);
  
  const hours = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
  const totalPrice = hours * parseFloat(lot.price_per_hour || 50);
  
  try {
    await connection.execute(
      `INSERT IGNORE INTO bookings (user_id, slot_id, lot_id, start_time, end_time, status, total_price, payment_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, slot.id, slot.lot_id, startDate, endDate, bookingStatuses[i % 5], totalPrice, paymentStatuses[i % 4]]
    );
    bookingCount++;
  } catch (e) {}
}

console.log(`✅ Created ${bookingCount} bookings\n`);

const [bookings] = await connection.execute('SELECT id, total_price, user_id FROM bookings LIMIT 500');

console.log('💳 Creating 500+ payments...');
let paymentCount = 0;
for (let i = 0; i < 500; i++) {
  const booking = bookings[i % bookings.length];
  const transactionId = `TXN-${Date.now()}-${i}`;
  
  try {
    await connection.execute(
      `INSERT IGNORE INTO payments (booking_id, user_id, amount, payment_method, transaction_id, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [booking.id, booking.user_id, booking.total_price, paymentMethods[i % 4], transactionId, paymentStatuses[i % 4]]
    );
    paymentCount++;
  } catch (e) {}
}

console.log(`✅ Created ${paymentCount} payments\n`);

console.log('\n✅ DATA SEEDING COMPLETED!');
console.log(`Total records: ${bookingCount + paymentCount}+`);

await connection.end();
