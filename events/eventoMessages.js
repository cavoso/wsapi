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
  
  //console.log(JSON.stringify(response, null, 2));
  console.log(response)
  
  let detectedEntities = response.entities;
  eventData.context.entitiesToUpdate = [];
  for(let dentity of eventData.Departamento.entity){
    console.log(JSON.stringify(dentity, null, 2));
    let detectedEntity = detectedEntities.find(entity => entity.entity === dentity);
    console.log(JSON.stringify(detectedEntity, null, 2));
    if (detectedEntity){
      let existingEntity = eventData.TicketData.find(ticketData => ticketData.key_name === detectedEntity.entity);
      if (!existingEntity){
        eventData.TicketData = await TicketService.agregarInformacionExtra(eventData.Ticket.id, detectedEntity.entity, detectedEntity.option);
        eventData.context.departamentreq[dentity] = true; // Marcar como true después de registrar el valor
      } else if (existingEntity.value !== detectedEntity.sourceText){
        eventData.context.entitiesToUpdate.push({
          key_name: detectedEntity.entity,
          oldValue: existingEntity.value,
          newValue: detectedEntity.option,
          process: false
        });
        eventData.context.departamentreq[dentity] = true;
      }
    }
  }
  if (eventData.context.entitiesToUpdate.length > 0) {
    eventData.context.enproceso = "ChangeEntity";
    conversations.set(eventData.Key_Context, eventData.context);
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