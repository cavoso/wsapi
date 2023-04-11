const mysql = require('mysql');

const connection = mysql.createConnection({
  host: '34.176.155.48',
  user: 'google',
  password: 'EVFQLY41LA18Rce',
  database: 'WaTicket'
});

connection.connect((error) => {
  if (error) {
    console.error('Error de conexión: ', error);
  } else {
    console.log('Conexión exitosa a MySQL!');
  }
});

function createRecord(tableName, data, callback) {
  const sql = `INSERT INTO ${tableName} SET ?`;

  connection.query(sql, data, (error, result) => {
    if (error) {
      return callback(error, null);
    }

    return callback(null, result);
  });
}

function getAllRecords(tableName, callback) {
  const sql = `SELECT * FROM ${tableName}`;

  connection.query(sql, (error, result) => {
    if (error) {
      return callback(error, null);
    }

    return callback(null, result);
  });
}

function updateRecord(tableName, id, data, callback) {
  const sql = `UPDATE ${tableName} SET ? WHERE id = ?`;

  connection.query(sql, [data, id], (error, result) => {
    if (error) {
      return callback(error, null);
    }

    return callback(null, result);
  });
}

function deleteRecord(tableName, id, callback) {
  const sql = `DELETE FROM ${tableName} WHERE id = ?`;

  connection.query(sql, id, (error, result) => {
    if (error) {
      return callback(error, null);
    }

    return callback(null, result);
  });
}

function getRecords(tableName, conditions, callback) {
  const sql = `SELECT * FROM ${tableName} WHERE ${conditions}`;

  connection.query(sql, (error, result) => {
    if (error) {
      return callback(error, null);
    }

    return callback(null, result);
  });
}

module.exports = {
  createRecord,
  getAllRecords,
  updateRecord,
  deleteRecord,
  getRecords
};