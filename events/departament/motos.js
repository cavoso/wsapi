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
        .createTextMessage(`¡Hola! Soy RSAsist, tu asistente virtual. Estoy aquí para ayudarte con tus consultas sobre la compra de motocicletas. Si necesitas ayuda o información sobre nuestros modelos, precios y disponibilidad, simplemente escribe "menu" en cualquier momento y te mostraré las opciones disponibles. ¡Estoy aquí para ayudarte en tu búsqueda de la motocicleta perfecta!`);
        
        eventData.context.saludobot = false;
      }else{
        msg = new whatsappMessage(eventData.Ticket.wa_id)
        .createTextMessage(`¡Hola de nuevo! Bienvenido de vuelta a RSAsist, tu asistente virtual. Si necesitas ayuda o tienes más preguntas sobre motocicletas, repuestos y más, no dudes en preguntar. Recuerda que puedes escribir "menu" en cualquier momento para ver las opciones disponibles. ¡Estoy aquí para ayudarte!`);
      }
      await MessageService.EnviarMensaje(eventData.Departamento, eventData.Ticket, msg);
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