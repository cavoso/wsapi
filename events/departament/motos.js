const db = require('../../models');
const {  WSProc, moment, regex, delay, TsToDateString  } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('../../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../../lib');

module.exports = async function evento(response, eventData, conversations) {
  console.log(JSON.stringify(eventData, null, 2));
  switch(response.intent){
    case 'saludo':
      /*
      let msg = new whatsappMessage("").createTextMessage(`Ticket creado exitosamente. ID asignado: ${String(eventData.Ticket.id).padStart(5, '0')}.`);
      await MessageService.EnviarMensaje(eventData.Departamento, eventData.Ticket, msg);
      */
      break;
    case 'verificacion':
      break;
    case 'ciudad':
      break;
    case 'omitir':
      break;
    default:
      break;
  }
  
};