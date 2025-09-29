require('dotenv').config();
const db = require('./db');

const getUsers = async () => {
  try {
    const { rows } = await db.query('SELECT id, username, email FROM users');
    console.log('Users in database:');
    console.table(rows);
  } catch (err) {
    console.error('Error fetching users', err.stack);
  } finally {
    // The pool will be closed automatically when the script ends
  }
};

getUsers();