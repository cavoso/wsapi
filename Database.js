const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'tu_usuario',
  password: 'tu_contraseña',
  database: 'nombre_de_la_base_de_datos'
});

connection.connect((error) => {
  if (error) {
    console.error('Error de conexión: ', error);
  } else {
    console.log('Conexión exitosa a MySQL!');
  }
});

function createRecord(data, callback) {
  const sql = 'INSERT INTO tabla SET ?';

  connection.query(sql, data, (error, result) => {
    if (error) {
      return callback(error, null);
    }

    return callback(null, result);
  });
}

function getAllRecords(callback) {
  const sql = 'SELECT * FROM tabla';

  connection.query(sql, (error, result) => {
    if (error) {
      return callback(error, null);
    }

    return callback(null, result);
  });
}

function updateRecord(id, data, callback) {
  const sql = 'UPDATE tabla SET ? WHERE id = ?';

  connection.query(sql, [data, id], (error, result) => {
    if (error) {
      return callback(error, null);
    }

    return callback(null, result);
  });
}

function deleteRecord(id, callback) {
  const sql = 'DELETE FROM tabla WHERE id = ?';

  connection.query(sql, id, (error, result) => {
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
  deleteRecord
};