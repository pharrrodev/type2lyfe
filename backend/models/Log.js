const db = require('./db');

const Log = {};

Log.create = async (user_id, timestamp, type, data) => {
  const query = {
    text: 'INSERT INTO logs(user_id, timestamp, type, data) VALUES($1, $2, $3, $4) RETURNING *',
    values: [user_id, timestamp, type, data],
  };
  const { rows } = await db.query(query.text, query.values);
  // Return in the same format as findByUserIdAndType for consistency
  return { id: rows[0].id, ...rows[0].data, timestamp: rows[0].timestamp };
};

Log.findByUserId = async (user_id) => {
  const query = {
    text: 'SELECT * FROM logs WHERE user_id = $1 ORDER BY timestamp DESC',
    values: [user_id],
  };
  const { rows } = await db.query(query.text, query.values);
  return rows;
};

Log.findByUserIdAndType = async (user_id, type) => {
  const query = {
    text: 'SELECT * FROM logs WHERE user_id = $1 AND type = $2 ORDER BY timestamp DESC',
    values: [user_id, type],
  };
  const { rows } = await db.query(query.text, query.values);
  return rows.map(row => ({ id: row.id, ...row.data, timestamp: row.timestamp }));
};

module.exports = Log;