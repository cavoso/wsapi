const db = require('../models');


module.exports = async function evento(datos) {
  //aqui se actualizan los estados de los mensajes
  console.log(datos)
  let mensaje = await db.Message.findOne({ where: { wamid: datos.id } });
  if(mensaje){
    mensaje.update({status: datos.status});
  }
  
};