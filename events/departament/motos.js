const db = require('../../models');
const {  WSProc, moment, regex, delay, TsToDateString  } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('../../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../../lib');

module.exports = async function evento(response, eventData, conversations, message) {
  eventData.updateRequisites();
  //console.log(JSON.stringify(eventData, null, 2));
  console.log(JSON.stringify(response.intent, null, 2));
  if(eventData.context.enproceso == ''){
    
  }else{
    switch(eventData.context.enproceso){
      case '':
        break;
    }
  }
  
  
  eventData.updateRequisites();
  conversations.set(eventData.Key_Context, eventData.context);
  
};

async function GenerarMenu(eventData){
  eventData.context.enproceso = "Menu";
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
      msgobject.addRow(marca.nombre, marca.id);
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