const db = require('../../models');
const { WSProc, moment, regex, delay, TsToDateString } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('../../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../../lib');



const Middleware = async (req, res, next) => {
  const datos = WSProc(req.body);
  const message = datos.messages[0];
  
  await TicketService.agregarMensaje(req.app.Ticket, {
    ticket_id: req.app.Ticket.id,
    wamid: message.id,
    content: JSON.stringify(message),
    direction: "INCOMING",
    created_at: TsToDateString(message.timestamp)
  });
  
  let text = "";
  let type = message.type;
  if (type === "text") {
    text = message.text.body;
  }else if(type === "interactive"){
    if(message.interactive.type === "list_reply"){
      text = message.interactive.list_reply.id;
    }else if(message.interactive.type === "button_reply"){
      text = message.interactive.button_reply.id;
    }
  }
  
  let response = await req.app.nlp.process('es', text, req.app.context);
  
  
  switch(response.intent){
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