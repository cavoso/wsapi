const db = require('../../models');
const { WSProc, moment, regex, delay, TsToDateString } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('../../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../../lib');



const Middleware = async (req, res, next) => {
  const datos = WSProc(req.body);
  const message = datos.messages[0]; 
  
  
  switch(req.app.response.intent){
    case 'reserva':
      break;
    case 'verificacion':
      break;
    case 'omitir':
      break;
    case 'ciudad':
      break;
    default:
      break;
  }
  
  
  next();
};


module.exports = Middleware;