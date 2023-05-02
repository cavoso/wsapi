const db = require('../../models');
const {  WSProc, moment, regex, delay, TsToDateString  } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('//services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('//lib');

module.exports = async function evento(response, eventData, conversations) {

  switch(response.intent){
    case 'saludo':
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