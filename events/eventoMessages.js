const db = require('../models');
const {  WSProc, moment, regex, delay, TsToDateString  } = require('../utils');
const { ClienteService, TicketService, MessageService } = require('../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../lib');
const { motosEvents, repuestosEvents, tallerEvents, postventaEvents, otrosEvents} = require('./departament');

module.exports = async function evento(eventData, conversations, message, nlp) {
  
  await TicketService.agregarMensaje(eventData.Ticket, {
    ticket_id: eventData.Ticket.id,
    wamid: message.id,
    content: JSON.stringify(message),
    direction: "INCOMING",
    created_at: TsToDateString(message.timestamp)
  });
  
  //console.log(JSON.stringify(message, null, 2));
  console.log(message);
  
  let text = "";
  if (message.type === "text") {
    text = message.text.body;
  }
  if(message.type === "interactive"){
    if(message.interactive.type === "list_reply"){
      eventData.context.reply = message.interactive.list_reply.id;
    }else if(message.interactive.type === "button_reply"){
      eventData.context.reply = message.interactive.button_reply.id;
    }
  }
  
  const urls = text.match(regex);
  if(urls){
    urls.forEach(async url => {
      eventData.TicketData = await TicketService.agregarInformacionExtra(eventData.Ticket.id,"url", url);
    });
  }
  
  let response = await nlp.process('es', text, eventData.context);
  
  //console.log(JSON.stringify(response, null, 2));
  console.log(response);
  let entitys = await db.Entity.findAll({
    attributes: ['name'],
    group : ['name']
  });
  let detectedEntities = response.entities;
  for (let entity of entitys) {
    let detectedEntity = detectedEntities.find(entity => entity.entity === entity.name);
    if (detectedEntity){
      eventData.TicketData = await TicketService.agregarInformacionExtra(eventData.Ticket.id, detectedEntity.entity, detectedEntity.option);
      if (entity.name in eventData.context.departamentreq) {
        eventData.context.departamentreq[entity.name] = true;
        eventData.updateRequisites();
        conversations.set(eventData.Key_Context, eventData.context);
      }      
    }
  }
  
 
  switch(eventData.Departamento.id){
    case 1: await motosEvents(response, eventData, conversations, message);
      break
    case 2: await repuestosEvents(response, eventData, conversations, message);
      break
    case 3: await tallerEvents(response, eventData, conversations, message);
      break
    case 4: await postventaEvents(response, eventData, conversations, message);
      break
    default: await otrosEvents(response, eventData, conversations, message);
      break
  }
};