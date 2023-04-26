const db = require('./../models');
const { WSProc } = require('./../utils');

const messageMiddleware = async (req, res, next) => {
  const datos = WSProc(req.body);
  
  if ("messages" in datos){
    
    switch(req.app.Departamento.id){
        
    }
    
  }
  
  // Pasa al siguiente middleware
  next();
};

module.exports = messageMiddleware;
