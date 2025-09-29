const db = require('./db');

const User = {};

User.create = async (username, email, password_hash) => {
  const query = {
    text: 'INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3) RETURNING *',
    values: [username, email, password_hash],
  };
  const { rows } = await db.query(query.text, query.values);
  return rows[0];
};

User.findByEmail = async (email) => {
  const query = {
    text: 'SELECT * FROM users WHERE email = $1',
    values: [email],
  };
  const { rows } = await db.query(query.text, query.values);
  return rows[0];
};

module.exports = User;