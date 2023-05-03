const db = require('../../models');
const {  WSProc, moment, regex, delay, TsToDateString  } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('../../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../../lib');

module.exports = async function evento(response, eventData, conversations) {
  eventData.updateRequisites();
  //console.log(JSON.stringify(eventData, null, 2));
  switch(response.intent){
    case 'saludo':
      let msg = "";
      if(!eventData.context.saludobot){
        msg = new whatsappMessage(eventData.Ticket.wa_id)
        .createTextMessage(`¡Hola! Soy RSAsist, tu asistente en la búsqueda de la moto ideal. Escribe "menu" en cualquier momento para ver opciones.`);
        
        eventData.context.saludobot = false;
      }else{
        msg = new whatsappMessage(eventData.Ticket.wa_id)
        .createTextMessage(`¡Hola de nuevo! Soy RSAsist, tu asistente en la búsqueda de la moto ideal. Recuerda que puedes escribir "menu" en cualquier momento para ver opciones.`);
      }
      await MessageService.EnviarMensaje(eventData.Departamento, eventData.Ticket, msg);
      
      if(!eventData.context.departamentreq.marca){
        
      }
      
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
  
  eventData.updateRequisites();
  conversations.set(eventData.Key_Context, eventData.context);
  
};