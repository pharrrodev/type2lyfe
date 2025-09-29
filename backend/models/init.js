const db = require('./db');

const createTables = async () => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    await client.query('DROP TABLE IF EXISTS logs CASCADE;');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        timestamp TIMESTAMPTZ NOT NULL,
        type VARCHAR(50) NOT NULL,
        data JSONB NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_medications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        dosage VARCHAR(255),
        unit VARCHAR(50)
      );
    `);

    await client.query('COMMIT');
    console.log('Tables created successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating tables', err.stack);
  } finally {
    client.release();
  }
};

createTables();