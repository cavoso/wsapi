const db = require('./../models');
const { WSProc, moment, regex, delay, TsToDateString } = require('./../utils');

const statusesMiddleware = async (req, res, next) => {
  
   const datos = WSProc(req.body);
  
  if("statuses" in datos){
    //aqui se actualizan los estados de los mensajes
    let mensaje = await db.Message.findOne({ where: { wamid: datos.statuses[0].id } });
    if(mensaje){
      mensaje.update({status: datos.statuses[0].status});
    }
    
  }

  // Pasa al siguiente middleware
  next();
};

module.exports = statusesMiddleware;
