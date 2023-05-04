const db = require('../../models');
const {  WSProc, moment, regex, delay, TsToDateString  } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('../../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../../lib');

const keyReply = "8fK2s";

module.exports = async function evento(response, eventData, conversations, message) {
  eventData.updateRequisites();
  //console.log(JSON.stringify(eventData, null, 2));
  //console.log(response);
  switch(response.intent){
    case 'saludo':
      let msg = "";
      if(!eventData.context.saludobot){
        msg = new whatsappMessage(eventData.Ticket.wa_id)
          .createTextMessage(`¡Hola! Soy RSAsist, tu asistente en la búsqueda de la moto ideal. Escribe "menu" en cualquier momento para ver opciones.`);
        eventData.context.saludobot = true;
      }else{
        msg = new whatsappMessage(eventData.Ticket.wa_id)
          .createTextMessage(`¡Hola de nuevo! Soy RSAsist, tu asistente en la búsqueda de la moto ideal. Recuerda que puedes escribir "menu" en cualquier momento para ver opciones.`);
      }
      await MessageService.EnviarMensaje(eventData.Departamento, eventData.Ticket, msg);
      delay(2000);
      await GenerarMenu(eventData);
      break;
    case 'verificacion':
      break;
    case 'ciudad':
      break;
    case 'omitir':
      break;
    default:
      if(response.utternace.includes(keyReply)){
        let rev = response.utternace.split("_");
        if(rev[0] === 'req'){
          if(rev[1] === 'marca'){
            let marcas = await db.MenuVehiculos.findAll({
              where: {
                padre: 0
              }
            });
          }
          
        }
        
        console.log("entra aqui");
      }else{
        await MessageService.EnviarMensaje(
          eventData.Departamento,
          eventData.Ticket,
          new whatsappMessage(eventData.Ticket.wa_id)
          .createImageMessage("https://cdn.memegenerator.es/imagenes/memes/full/31/14/31142846.jpg")
        );
      }
      
      break;
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