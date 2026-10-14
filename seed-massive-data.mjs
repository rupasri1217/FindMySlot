import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🚀 Starting MASSIVE data seeding...\n');

const [users] = await connection.execute('SELECT id FROM users LIMIT 5');
const [lots] = await connection.execute('SELECT id, price_per_hour FROM parking_lots');
const [slots] = await connection.execute('SELECT id, lot_id FROM parking_slots');

console.log(`📊 Found ${users.length} users, ${lots.length} lots, ${slots.length} slots\n`);

const userIds = users.map(u => u.id);

const bookingStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
const paymentStatuses = ['unpaid', 'paid', 'refunded', 'failed'];
const paymentMethods = ['credit_card', 'debit_card', 'upi', 'wallet'];
const slotTypes = ['standard', 'premium', 'accessible'];
const vehicleTypes = ['sedan', 'suv', 'hatchback', 'bike', 'truck'];

console.log('📅 Creating 500+ sample bookings...');
let bookingCount = 0;
for (let i = 0; i < 500; i++) {
  const userId = userIds[i % userIds.length];
  const slot = slots[Math.floor(Math.random() * slots.length)];
  const lot = lots.find(l => l.id === slot.lot_id);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) - 30);
  startDate.setHours(Math.floor(Math.random() * 24));
  
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 8) + 1);
  
  const hours = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
  const totalPrice = hours * parseFloat(lot.price_per_hour || 50);
  const slotType = slotTypes[Math.floor(Math.random() * slotTypes.length)];
  const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
  
  try {
    await connection.execute(
      `INSERT INTO bookings (user_id, slot_id, lot_id, start_time, end_time, status, total_price, payment_status, slot_type, vehicle_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, slot.id, slot.lot_id, startDate, endDate, bookingStatuses[i % 5], totalPrice, paymentStatuses[i % 4], slotType, vehicleType]
    );
    bookingCount++;
  } catch (e) {
    // Ignore duplicates
  }
}

const [bookings] = await connection.execute('SELECT id, total_price, user_id FROM bookings LIMIT 1000');

console.log(`✅ Created ${bookingCount} bookings\n`);

console.log('💳 Creating 1000+ sample payments...');
let paymentCount = 0;
for (let i = 0; i < 1000; i++) {
  const booking = bookings[i % bookings.length];
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`;
  const status = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
  const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
  
  try {
    await connection.execute(
      `INSERT INTO payments (booking_id, user_id, amount, payment_method, transaction_id, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [booking.id, booking.user_id, booking.total_price, method, transactionId, status]
    );
    paymentCount++;
  } catch (e) {
    // Ignore
  }
}

console.log(`✅ Created ${paymentCount} payments\n`);

console.log('🔔 Creating 200+ sample notifications...');
const notificationTypes = ['booking_confirmation', 'reminder', 'overstay_alert', 'availability_update', 'promotional', 'payment_success', 'payment_failed', 'booking_cancelled'];
let notifCount = 0;
for (let i = 0; i < 200; i++) {
  const userId = userIds[i % userIds.length];
  const type = notificationTypes[i % notificationTypes.length];
  const message = `Notification for booking #${bookings[i % bookings.length].id}`;
  
  try {
    await connection.execute(
      `INSERT INTO notifications (user_id, type, title, message, is_read, sent_via) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, type.replace('_', ' ').toUpperCase(), message, Math.random() > 0.6, JSON.stringify(['in_app', 'email'])]
    );
    notifCount++;
  } catch (e) {
    // Ignore
  }
}

console.log(`✅ Created ${notifCount} notifications\n`);

console.log('⚠️ Creating 100+ sample violations...');
const violationTypes = ['overstay', 'unauthorized_parking', 'invalid_slot', 'damage', 'no_payment'];
let violationCount = 0;
for (let i = 0; i < 100; i++) {
  const booking = bookings[i % bookings.length];
  const violationType = violationTypes[i % violationTypes.length];
  const fineAmount = [500, 1000, 1500, 2000, 2500][i % 5];
  const status = ['reported', 'acknowledged', 'resolved', 'paid'][i % 4];
  const description = `Violation: ${violationType} at parking lot`;
  
  try {
    await connection.execute(
      `INSERT INTO violations (booking_id, user_id, lot_id, violation_type, description, fine_amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [booking.id, booking.user_id, booking.lot_id, violationType, description, fineAmount, status]
    );
    violationCount++;
  } catch (e) {
    // Ignore
  }
}

console.log(`✅ Created ${violationCount} violations\n`);

console.log('⭐ Creating 300+ sample reviews...');
const reviewComments = [
  'Excellent parking facility!',
  'Very convenient location.',
  'Clean and well-maintained.',
  'Great amenities!',
  'Fast and easy booking.',
  'Friendly staff.',
  'Good value for money.',
  'Highly recommend!',
  'Perfect for long-term parking.',
  'Easy access and navigation.',
  'Safe and secure.',
  'Reasonable rates.',
  'Excellent customer support.',
  'Very satisfied!',
  'Quick experience.'
];

let reviewCount = 0;
for (let i = 0; i < 300; i++) {
  const userId = userIds[i % userIds.length];
  const lot = lots[i % lots.length];
  const rating = Math.floor(Math.random() * 5) + 1;
  const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
  
  try {
    await connection.execute(
      `INSERT INTO reviews (user_id, lot_id, rating, comment) 
       VALUES (?, ?, ?, ?)`,
      [userId, lot.id, rating, comment]
    );
    reviewCount++;
  } catch (e) {
    // Ignore
  }
}

console.log(`✅ Created ${reviewCount} reviews\n`);

console.log('❤️ Creating 50+ sample favorites...');
const labels = ['Home', 'Office', 'Mall', 'Hospital', 'Airport', 'Gym', 'Restaurant', 'Cinema', 'Park', 'School'];
let favCount = 0;
for (let i = 0; i < 50; i++) {
  const userId = userIds[i % userIds.length];
  const lot = lots[i % lots.length];
  
  try {
    await connection.execute(
      `INSERT INTO favorites (user_id, lot_id, label) 
       VALUES (?, ?, ?)`,
      [userId, lot.id, labels[i % labels.length]]
    );
    favCount++;
  } catch (e) {
    // Ignore
  }
}

console.log(`✅ Created ${favCount} favorites\n`);

console.log('\n✅ MASSIVE DATA SEEDING COMPLETED!');
console.log(`
📊 SUMMARY:
   • ${bookingCount} Bookings created
   • ${paymentCount} Payments created
   • ${notifCount} Notifications created
   • ${violationCount} Violations created
   • ${reviewCount} Reviews created
   • ${favCount} Favorites created
   
Total: ${bookingCount + paymentCount + notifCount + violationCount + reviewCount + favCount}+ dummy records
`);

await connection.end();
