const db = require('../../models');
const { WSProc, moment, regex, delay, TsToDateString } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('../../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../../lib');



const Middleware = async (req, res, next) => {
  const datos = WSProc(req.body);
  const message = datos.messages[0]; 
  
  for (const xentity of req.app.Departamento.entity) {
    const encontrado = req.app.TicketData.find(item => item.key_name === xentity);
    console.log(JSON.stringify(encontrado, null, 2));
    /*const marcaEntity = req.app.response.entities.find(entity => entity.entity === xentity);
    const valor = marcaEntity ? marcaEntity.option : null;
    if(valor !== null){
      req.app.TicketData = await TicketService.agregarInformacionExtra(req.app.Ticket.id,xentity, valor);
    }
    */
  }
  
  switch(req.app.response.intent){
    case 'reserva':
      break;
    case 'verificacion':
      //req.app.context.proceso
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