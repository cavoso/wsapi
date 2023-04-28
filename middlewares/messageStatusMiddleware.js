const db = require('./../models');
const { WSProc, moment, regex, delay, TsToDateString } = require('./../utils');

const messageStatusMiddleware = async (req, res, next) => {
  
  const datos = WSProc(req.body);
  console.log(datos)
  if("statuses" in datos){
    //aqui se actualizan los estados de los mensajes
    let mensaje = await db.xMessage.findOne({ where: { wamid: datos.statuses[0].id } });
    if(mensaje){
      mensaje.update({status: datos.statuses[0].status});
    }    
  }

  // Pasa al siguiente middleware
  next();
};

module.exports = messageStatusMiddleware;
