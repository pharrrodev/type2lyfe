const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createTestUser() {
  try {
    const username = 'testuser';
    const email = 'test@test.com';
    const password = 'test123';

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ Test user already exists!');
      console.log('📧 Email: test@test.com');
      console.log('🔑 Password: test123');
      console.log('👤 Username: testuser');
      pool.end();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, password_hash]
    );

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@test.com');
    console.log('🔑 Password: test123');
    console.log('👤 User ID:', result.rows[0].id);

    pool.end();
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    pool.end();
  }
}

createTestUser();

