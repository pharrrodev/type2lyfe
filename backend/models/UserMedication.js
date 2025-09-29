const db = require('./db');

const UserMedication = {};

UserMedication.create = async (user_id, name, dosage, unit) => {
  const query = {
    text: 'INSERT INTO user_medications(user_id, name, dosage, unit) VALUES($1, $2, $3, $4) RETURNING *',
    values: [user_id, name, dosage, unit],
  };
  const { rows } = await db.query(query.text, query.values);
  return rows[0];
};

UserMedication.findByUserId = async (user_id) => {
  const query = {
    text: 'SELECT * FROM user_medications WHERE user_id = $1',
    values: [user_id],
  };
  const { rows } = await db.query(query.text, query.values);
  return rows;
};

UserMedication.delete = async (id) => {
  const query = {
    text: 'DELETE FROM user_medications WHERE id = $1',
    values: [id],
  };
  await db.query(query.text, query.values);
};

UserMedication.update = async (id, name, dosage, unit) => {
  const query = {
    text: 'UPDATE user_medications SET name = $1, dosage = $2, unit = $3 WHERE id = $4 RETURNING *',
    values: [name, dosage, unit, id],
  };
  const { rows } = await db.query(query.text, query.values);
  return rows[0];
};

module.exports = UserMedication;