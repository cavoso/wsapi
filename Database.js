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

function createRecord(tableName, data) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO ${tableName} SET ?`;

    connection.query(sql, data, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function getAllRecords(tableName) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM ${tableName}`;

    connection.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function updateRecord(tableName, id, data) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE ${tableName} SET ? WHERE id = ?`;

    connection.query(sql, [data, id], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function updateTicket(tableName, id) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE ${tableName} SET ultimomensaje = NOW() WHERE id = ?`;

    connection.query(sql, [id], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function deleteRecord(tableName, id) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM ${tableName} WHERE id = ?`;

    connection.query(sql, id, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

function getRecords(tableName, conditions, callback) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM ${tableName} WHERE ${conditions}`;

    connection.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = {
  createRecord,
  getAllRecords,
  updateRecord,
  updateTicket,
  deleteRecord,
  getRecords
};