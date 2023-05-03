const db = require('../../models');
const {  WSProc, moment, regex, delay, TsToDateString  } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('../../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../../lib');

module.exports = async function evento(response, eventData, conversations) {
  eventData.updateRequisites();
  //console.log(JSON.stringify(eventData, null, 2));
  console.log(JSON.stringify(response.intent, null, 2));
  switch(response.intent){
    case 'saludo':
      let msg = "";
      if(!eventData.context.saludobot){
        msg = new whatsappMessage(eventData.Ticket.wa_id)
        .createTextMessage(`¡Hola! Soy RSAsist, tu asistente en la búsqueda de la moto ideal. Escribe "menu" en cualquier momento para ver opciones.`);
        
        eventData.context.saludobot = false;
      }else{
        msg = new whatsappMessage(eventData.Ticket.wa_id)
        .createTextMessage(`¡Hola de nuevo! Soy RSAsist, tu asistente en la búsqueda de la moto ideal. Recuerda que puedes escribir "menu" en cualquier momento para ver opciones.`);
      }
      await MessageService.EnviarMensaje(eventData.Departamento, eventData.Ticket, msg);
      delay(2000);
      if(!eventData.context.departamentreq.marca){
        let msgobject = new messageObject("Menu", "list");
        let marcas = await db.MenuVehiculos.findAll({
          where: {
            padre: 0
          }
        });
        for(let marca of marcas){
          msgobject.addRow(marca.nombre, marca.nombre);
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

      }
      
      break;
    case 'verificacion':
      break;
    case 'ciudad':
      break;
    case 'omitir':
      break;
    default:
      break;
  }
  
  eventData.updateRequisites();
  conversations.set(eventData.Key_Context, eventData.context);
  
};