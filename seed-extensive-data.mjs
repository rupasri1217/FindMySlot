import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🌱 Starting extensive data seeding...\n');

// Get existing data
const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
const [lots] = await connection.execute('SELECT id, price_per_hour FROM parking_lots');
const [slots] = await connection.execute('SELECT id, lot_id FROM parking_slots');

const userId = users[0]?.id || 1;

// Sample booking data
const bookingStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
const paymentStatuses = ['unpaid', 'paid', 'refunded'];

console.log('📅 Creating 25 sample bookings...');
for (let i = 0; i < Math.min(25, slots.length); i++) {
  const slot = slots[i];
  const lot = lots.find(l => l.id === slot.lot_id);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 8) + 1);
  
  const hours = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
  const totalPrice = hours * parseFloat(lot.price_per_hour || 50);
  
  await connection.execute(
    `INSERT INTO bookings (user_id, slot_id, lot_id, start_time, end_time, status, total_price, payment_status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, slot.id, slot.lot_id, startDate, endDate, bookingStatuses[i % 5], totalPrice, paymentStatuses[i % 3]]
  );
}

// Get created bookings
const [bookings] = await connection.execute('SELECT id, total_price FROM bookings LIMIT 50');

console.log('💳 Creating 50 sample payments...');
const paymentMethods = ['credit_card', 'debit_card', 'upi', 'wallet'];
for (let i = 0; i < Math.min(50, bookings.length); i++) {
  const booking = bookings[i % bookings.length];
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`;
  const status = ['completed', 'completed', 'completed', 'pending', 'failed', 'refunded'][Math.floor(Math.random() * 6)];
  
  await connection.execute(
    `INSERT INTO payments (booking_id, user_id, amount, payment_method, transaction_id, status) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [booking.id, userId, booking.total_price, paymentMethods[i % 4], transactionId, status]
  );
}

console.log('🔔 Creating 40 sample notifications...');
const notificationTypes = ['booking_confirmation', 'reminder', 'overstay_alert', 'availability_update', 'promotional'];
const notificationMessages = {
  booking_confirmation: 'Your parking booking has been confirmed. Booking ID: #',
  reminder: 'Your parking session starts in 15 minutes. Please proceed to the lot.',
  overstay_alert: 'Your parking time has expired. Please vacate the spot immediately.',
  availability_update: 'New parking slots are now available at your favorite location!',
  promotional: 'Special offer: Get 20% off on bookings above 3 hours this weekend!'
};

for (let i = 0; i < 40; i++) {
  const type = notificationTypes[i % 5];
  const message = notificationMessages[type] + (type === 'booking_confirmation' ? bookings[i % bookings.length]?.id : '');
  
  await connection.execute(
    `INSERT INTO notifications (user_id, type, title, message, is_read, sent_via) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, type, type.replace('_', ' ').toUpperCase(), message, Math.random() > 0.5, JSON.stringify(['in_app', 'email'])]
  );
}

console.log('⚠️ Creating 20 sample violations...');
const violationTypes = ['overstay', 'unauthorized_parking', 'invalid_slot', 'damage'];
for (let i = 0; i < Math.min(20, bookings.length); i++) {
  const booking = bookings[i % bookings.length];
  const violationType = violationTypes[i % 4];
  const fineAmount = [500, 1000, 1500, 2000][i % 4];
  const status = ['reported', 'acknowledged', 'resolved', 'paid'][i % 4];
  
  const descriptions = {
    overstay: 'Vehicle remained in parking spot 2 hours after booking expired',
    unauthorized_parking: 'Vehicle parked in reserved/handicap spot without authorization',
    invalid_slot: 'Vehicle parked outside designated parking slot boundaries',
    damage: 'Vehicle caused damage to parking infrastructure or other vehicles'
  };
  
  await connection.execute(
    `INSERT INTO violations (booking_id, user_id, lot_id, violation_type, description, fine_amount, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [booking.id, userId, booking.lot_id, violationType, descriptions[violationType], fineAmount, status]
  );
}

console.log('⭐ Creating 100 sample reviews...');
for (let i = 0; i < 100; i++) {
  const lot = lots[i % lots.length];
  const rating = Math.floor(Math.random() * 5) + 1;
  
  const reviewComments = [
    'Excellent parking facility with great security!',
    'Very convenient location and affordable pricing.',
    'Clean and well-maintained parking lot.',
    'Great amenities including EV charging stations.',
    'Fast and easy booking process.',
    'Friendly staff and good customer service.',
    'Could use better lighting in some areas.',
    'Good value for money.',
    'Highly recommend this parking lot!',
    'Perfect for long-term parking.',
    'Easy access and good navigation.',
    'Safe and secure parking environment.',
    'Reasonable rates compared to competitors.',
    'Excellent customer support team.',
    'Very satisfied with the service.'
  ];
  
  const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
  
  await connection.execute(
    `INSERT INTO reviews (user_id, lot_id, rating, comment) 
     VALUES (?, ?, ?, ?)`,
    [userId, lot.id, rating, comment]
  );
}

console.log('❤️ Creating 15 sample favorites...');
for (let i = 0; i < Math.min(15, lots.length); i++) {
  const lot = lots[i];
  const labels = ['Home', 'Office', 'Mall', 'Hospital', 'Airport', 'Gym', 'Restaurant', 'Cinema', 'Park', 'School', 'Market', 'Station', 'Beach', 'Downtown', 'Suburb'];
  
  await connection.execute(
    `INSERT INTO favorites (user_id, lot_id, label) 
     VALUES (?, ?, ?)`,
    [userId, lot.id, labels[i % labels.length]]
  );
}

console.log('\n✅ Extensive data seeding completed!');
console.log(`
📊 Summary:
   • 25 Bookings created
   • 50 Payments created
   • 40 Notifications created
   • 20 Violations created
   • 100 Reviews created
   • 15 Favorites created
   
Total: 250+ dummy records added to the database
`);

await connection.end();
