const db = require('./../models');
const { WSProc, moment, regex, delay, TsToDateString } = require('./../utils');

const CheckDepartamentoMiddleware = async (req, res, next) => {
  
  const datos = WSProc(req.body);
  
  if("metadata" in datos){
    req.app.Departamento = await db.Department.findOne({
      where: {
        phone_number: datos.metadata.display_phone_number, 
        phone_number_id: datos.metadata.phone_number_id 
      } 
    });
    if(req.app.Departamento === null){
      return res.status(400).json({ error: 'Departamento no encontrado' });
    }
  }

  // Pasa al siguiente middleware
  next();
};

module.exports = CheckDepartamentoMiddleware;
