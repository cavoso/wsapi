const { WSProc } = require('./../utils');
const {
  motosMiddleware,
  repuestosMiddleware,
  tallerMiddleware,
  postventaMiddleware,
  otrosMiddleware
} = require('./departamentos');

const messageMiddleware = async (req, res, next) => {
  const datos = WSProc(req.body);
  
  if ("messages" in datos){
    
    switch(req.app.Departamento.id){
      case 1:
        motosMiddleware(req, res, next);
        break;
      case 2:
        repuestosMiddleware(req, res, next);
        break;
      case 3:
        tallerMiddleware(req, res, next);
        break;
      case 4:
        postventaMiddleware(req, res, next);
        break;
      case 5:
        otrosMiddleware(req, res, next);
        break;
      default:
        // Si no se encuentra un departamento válido, maneja el error o simplemente llama a next()
        next();
    }
    
  }
  
  // Pasa al siguiente middleware
  next();
};

module.exports = messageMiddleware;
