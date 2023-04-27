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
    
   console.log(JSON.stringify(req.app.TicketData, null, 2));
    
    req.app.Departamento.entity.forEach(async (xentity) => {
      const marcaEntity = req.app.response.entities.find(entity => entity.entity === xentity);
      const valor = marcaEntity ? marcaEntity.option : null;
      req.app.TicketData = await TicketService.agregarInformacionExtra(req.app.Ticket.id,xentity, valor);
    });
    
     console.log(JSON.stringify(req.app.TicketData, null, 2));
    
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
