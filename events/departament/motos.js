const db = require('../../models');
const {  WSProc, moment, regex, delay, TsToDateString  } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('../../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../../lib');

module.exports = async function evento(response, eventData, conversations) {
  eventData.updateRequisites();
  console.log(JSON.stringify(eventData, null, 2));
  switch(response.intent){
    case 'saludo':
      if(eventData.context.saludobot){
        //esto indica que es el primer saludo
      }else{
        let msg = new whatsappMessage(eventData.Ticket.wa_id).createTextMessage(``);
        await MessageService.EnviarMensaje(eventData.Departamento, eventData.Ticket, msg);
      }
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