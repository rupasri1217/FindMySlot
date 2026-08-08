import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop() || 'parking_db',
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

async function resetData() {
  const connection = await pool.getConnection();
  try {
    console.log('Resetting data...');
    
    // Get Rupa's user ID
    const [users] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['rupasri7842@gmail.com']
    );
    
    if (users.length === 0) {
      console.log('Rupa not found');
      return;
    }
    
    const rupaId = users[0].id;
    console.log('Rupa ID:', rupaId);
    
    // Delete all bookings except Rupa's
    await connection.query('DELETE FROM bookings WHERE userId != ?', [rupaId]);
    console.log('Deleted non-Rupa bookings');
    
    // Keep only 2-3 active bookings for Rupa, delete rest
    const [rupaBookings] = await connection.query(
      'SELECT id FROM bookings WHERE userId = ? ORDER BY createdAt DESC LIMIT 3',
      [rupaId]
    );
    
    const keepIds = rupaBookings.map(b => b.id);
    if (keepIds.length > 0) {
      const placeholders = keepIds.map(() => '?').join(',');
      await connection.query(
        `DELETE FROM bookings WHERE userId = ? AND id NOT IN (${placeholders})`,
        [rupaId, ...keepIds]
      );
      console.log(`Kept ${keepIds.length} active bookings for Rupa`);
    }
    
    // Delete all payments except those linked to Rupa's bookings
    if (keepIds.length > 0) {
      const placeholders = keepIds.map(() => '?').join(',');
      await connection.query(
        `DELETE FROM payments WHERE bookingId NOT IN (${placeholders})`,
        keepIds
      );
    } else {
      await connection.query('DELETE FROM payments');
    }
    console.log('Cleaned up payments');
    
    // Delete all notifications except Rupa's
    await connection.query('DELETE FROM notifications WHERE userId != ?', [rupaId]);
    console.log('Cleaned up notifications');
    
    // Delete all reviews except for Rupa's bookings
    if (keepIds.length > 0) {
      const placeholders = keepIds.map(() => '?').join(',');
      await connection.query(
        `DELETE FROM reviews WHERE bookingId NOT IN (${placeholders})`,
        keepIds
      );
    } else {
      await connection.query('DELETE FROM reviews');
    }
    console.log('Cleaned up reviews');
    
    // Delete all violations except for Rupa's bookings
    if (keepIds.length > 0) {
      const placeholders = keepIds.map(() => '?').join(',');
      await connection.query(
        `DELETE FROM violations WHERE bookingId NOT IN (${placeholders})`,
        keepIds
      );
    } else {
      await connection.query('DELETE FROM violations');
    }
    console.log('Cleaned up violations');
    
    // Delete all favorites except Rupa's
    await connection.query('DELETE FROM favorites WHERE userId != ?', [rupaId]);
    console.log('Cleaned up favorites');
    
    // Delete all wallet transactions except Rupa's
    await connection.query('DELETE FROM walletTransactions WHERE userId != ?', [rupaId]);
    console.log('Cleaned up wallet transactions');
    
    console.log('Data reset complete!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.release();
    await pool.end();
  }
}

resetData();
