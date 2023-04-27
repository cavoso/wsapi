const {  WSProc, moment, regex, delay, TsToDateString  } = require('./../utils');
const { ClienteService, TicketService, MessageService } = require('../services');
const db = require('../models');
const {
  motosMiddleware,
  repuestosMiddleware,
  tallerMiddleware,
  postventaMiddleware,
  otrosMiddleware
} = require('./departamentos');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../lib');

const messageMiddleware = async (req, res, next) => {
  const datos = WSProc(req.body);
  
  
  if ("messages" in datos){
    
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
    
    const urls = text.match(regex);
    if(urls){
      urls.forEach(async url => {
        req.app.TicketData = await TicketService.agregarInformacionExtra(req.app.Ticket.id,"url", url);
      });
    }
    
    req.app.response = await req.app.nlp.process('es', text, req.app.context);

    console.log(JSON.stringify(req.app.context, null, 2));
    
    if(!req.app.context.saludobot && req.app.response.intent !== "saludo"){
      let msg = new whatsappMessage(req.app.waid).createTextMessage(`¡Hola, ${req.app.Cliente.getDisplayName()} ! Soy tu Asistente Virtual. Para interactuar conmigo, escribe 'bot' o 'menú'. ¡Estoy aquí para  ayudarte!`);      
      console.log(msg)
      //MessageService.EnviarMensaje(req.app.Departamento, req.app.Ticket, msg);
      
    }
    
    
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
  
};

module.exports = messageMiddleware;
