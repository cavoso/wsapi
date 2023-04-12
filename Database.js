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

function getRecords(tableName, conditions) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM ${tableName}`;

    if (conditions) {
      // Manejo de joins
      if (conditions.join) {
        const join = conditions.join;
        query += ` INNER JOIN ${join.table} ON ${join.condition}`;
      }

      // Manejo de filtros
      if (conditions.filters) {
        const filters = conditions.filters.map(filter => {
          const operator = filter.operator || "=";
          return `${filter.field} ${operator} ${connection.escape(filter.value)}`;
        }).join(" AND ");

        if (filters) {
          query += ` WHERE ${filters}`;
        }
      }

      // Manejo de operadores lógicos
      if (conditions.orFilters) {
        const orFilters = conditions.orFilters.map(filter => {
          const operator = filter.operator || "=";
          return `${filter.field} ${operator} ${connection.escape(filter.value)}`;
        }).join(" OR ");

        if (orFilters) {
          if (!query.includes("WHERE")) {
            query += " WHERE";
          } else {
            query += " OR";
          }

          query += ` ${orFilters}`;
        }
      }

      // Manejo de ordenamiento
      if (conditions.orderBy) {
        query += ` ORDER BY ${conditions.orderBy}`;
      }

      // Manejo de límite y offset
      if (conditions.limit) {
        query += ` LIMIT ${conditions.limit}`;

        if (conditions.offset) {
          query += ` OFFSET ${conditions.offset}`;
        }
      }
    }

    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
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