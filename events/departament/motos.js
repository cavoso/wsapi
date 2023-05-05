const db = require('../../models');
const {  WSProc, moment, regex, delay, TsToDateString  } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('../../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../../lib');

const keyReply = "8fK2s";

module.exports = async function evento(response, eventData, conversations, message) {
  eventData.updateRequisites();
  //console.log(JSON.stringify(eventData, null, 2));
  console.log(eventData);
  
  if(response.answer){
    await MessageService.EnviarMensaje(
      eventData.Departamento, 
      eventData.Ticket, 
      new whatsappMessage(eventData.Ticket.wa_id)
          .createTextMessage(response.answer)
    );
  }
  
  eventData.updateRequisites();
  conversations.set(eventData.Key_Context, eventData.context);
  
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