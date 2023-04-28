const db = require('../models');


module.exports = async function evento(eventData, datos) {
  eventData.Departamento = await db.Department.findOne({
      where: {
        phone_number: datos.display_phone_number, 
        phone_number_id: datos.phone_number_id 
      } 
    });
};