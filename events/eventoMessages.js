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
  
  let text = "";
  if (message.type === "text") {
    text = message.text.body;
  }else if(message.type === "interactive"){
    if(message.interactive.type === "list_reply"){
      text = message.interactive.list_reply.id;
    }else if(message.interactive.type === "button_reply"){
      text = message.interactive.button_reply.id;
    }
  }
  
  const urls = text.match(regex);
  if(urls){
    urls.forEach(async url => {
      eventData.TicketData = await TicketService.agregarInformacionExtra(eventData.Ticket.id,"url", url);
    });
  }
  
  let response = await nlp.process('es', text, eventData.context);
  //console.log(response.intent)
  let detectedEntities = response.entities;
  let entitiesToUpdate = [];
  for (let entity of detectedEntities) {
    let existingEntity = eventData.TicketData.find(ticketData => ticketData.key_name === entity.option);
    if (!existingEntity) {
      eventData.TicketData = await TicketService.agregarInformacionExtra(eventData.Ticket.id, entity.option, entity.sourceText);
    } else if (existingEntity.value !== entity.sourceText) {
      // Si la entidad ya está presente en eventData.TicketData y su valor es diferente, añade la entidad y su nuevo valor al array entitiesToUpdate
      eventData.context.entitiesToUpdate.push({
        key_name: entity.option,
        oldValue: existingEntity.value,
        newValue: entity.sourceText,
        process: false
      });
      eventData.context.enproceso = "ChangeEntity";
    }
  }
  
  
  
  switch(eventData.Departamento.id){
    case 1: await motosEvents(response, eventData, conversations);
      break
    case 2: await repuestosEvents(response, eventData, conversations);
      break
    case 3: await tallerEvents(response, eventData, conversations);
      break
    case 4: await postventaEvents(response, eventData, conversations);
      break
    default: await otrosEvents(response, eventData, conversations);
      break
  }
};