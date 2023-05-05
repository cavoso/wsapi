const db = require('../../models');
const {  WSProc, moment, regex, delay, TsToDateString  } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('../../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../../lib');

const keyReply = "8fK2s";

module.exports = async function evento(response, eventData, conversations, message) {
  //console.log(JSON.stringify(eventData, null, 2));
  console.log(eventData);
  let detectedEntities = response.entities;
  let intents = response.classifications;
  console.log(intents);
  console.log(detectedEntities);
  
  if(response.answer){
    await MessageService.EnviarMensaje(
      eventData.Departamento, 
      eventData.Ticket, 
      new whatsappMessage(eventData.Ticket.wa_id)
          .createTextMessage(response.answer)
    );
  }
  
  if(eventData.context.departamentreq.marca === false){
    //no esta seteada la marca
    let detectedEntity = detectedEntities.find(entity => entity.entity === "marca");
    if (detectedEntity){
      //se reconocio la marca
      eventData.TicketData = await TicketService.agregarInformacionExtra(eventData.Ticket.id, detectedEntity.entity, detectedEntity.option);
      eventData.context.departamentreq.marca = true;
      eventData.updateRequisites();
      conversations.set(eventData.Key_Context, eventData.context);
    }else{
      //no se encontro la marca
      let msgobject = new messageObject("Menu", "list");
      let marcas = await db.MenuVehiculos.findAll({
        where: {
          padre: 0
        }
      });
      for(let marca of marcas){
        msgobject.addRow(marca.nombre, `${keyReply}_req_marca_${marca.id}`);
      }
      await MessageService.EnviarMensaje(
        eventData.Departamento,
        eventData.Ticket,
        new whatsappMessage(eventData.Ticket.wa_id).createInteractiveMessage(
          new messageInteractive("list").addBody("Por favor seleccione la marca").addFooter("RSAsist Menu").addAction(
            new messageAction("list").addButton("Menu").addSection(msgobject.toJSON()).toJSON()
          ).toJSON()
        )
      );
      return ;
    }
  }else{
    //ya esta seteada la marca
    if(eventData.context.reply.includes(`${keyReply}_req_marca_`)){
      eventData.context.reply = ""; 
      await MessageService.EnviarMensaje(
        eventData.Departamento, 
        eventData.Ticket, 
        new whatsappMessage(eventData.Ticket.wa_id)
            .createTextMessage("Lo siento, pero la marca ya se encuentra registrada, si desea modificarla por favor utilice el menú")
        );
    }
    
  }
  
  if(){
    
  }
  
  switch(response.intent){
    case 'saludo':
      break;
    case 'reserva':
      break;
    case 'ciudad':
      break;
    case 'verificacion':
      break;
    case 'omitir':
      break;
    default:
      break;
  }
  
  
  
};

async function GenerarMenu(eventData){
  
  let msgobject = new messageObject("Menu", "list");
  let msgmenu = "";
  let marcas = await db.MenuVehiculos.findAll({
    where: {
      padre: 0
    }
  });
  if(!eventData.context.departamentreq.marca){
    msgmenu = "Por favor seleccione la marca";
    for(let marca of marcas){
      msgobject.addRow(marca.nombre, `${keyReply}_req_marca_id_${marca.id}`);
    }
  }
  await MessageService.EnviarMensaje(
    eventData.Departamento,
    eventData.Ticket,
    new whatsappMessage(eventData.Ticket.wa_id).createInteractiveMessage(
      new messageInteractive("list").addBody(msgmenu).addFooter("RSAsist Menu").addAction(
        new messageAction("list").addButton("Menu").addSection(msgobject.toJSON()).toJSON()
      ).toJSON()
    )
  );
}