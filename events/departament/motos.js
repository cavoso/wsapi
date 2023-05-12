const db = require('../../models');
const Sequelize = require('sequelize');
const {  WSProc, moment, regex, delay, TsToDateString  } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('../../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../../lib');

const keyReply = "8fK2s";

module.exports = async function evento(response, eventData, conversations, message) {
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
      if(eventData.context.reply !== ""){
        if(eventData.context.reply.includes(`${keyReply}_req_marca_`)){
          let marca = eventData.context.reply.replace(`${keyReply}_req_marca_`, '');
          let record = eventData.TicketData.find(record => record.key_name === "marca");
          if (record){
            await MessageService.EnviarMensaje(
                eventData.Departamento,
                eventData.Ticket,
                new whatsappMessage(eventData.Ticket.wa_id).createInteractiveMessage(
                  new messageInteractive("button").addBody(`La marca ${record.value} está registrada. ¿Prefieres cambiar a ${marca}?`).addFooter("RSAsist Menu").addAction(
                    new messageAction("button")
                      .addButton(`Si`, `${keyReply}_cambiar_marca_${marca}`)
                      .addButton(`No`, `${keyReply}_nocambiar_marca_${record.value}`)
                      .toJSON()
                  ).toJSON()
                )
              );
              eventData.context.reply = "";
              return ;
          }else{
            eventData.TicketData = await TicketService.agregarInformacionExtra(eventData.Ticket.id, "marca", marca);
            eventData.context.departamentreq.marca = true;
            eventData.updateRequisites();
            conversations.set(eventData.Key_Context, eventData.context);
          }
        }else if(eventData.context.reply.includes(`${keyReply}_cambiar_marca_`)){
          let marca = eventData.context.reply.replace(`${keyReply}_req_marca_`, '');
          let record = eventData.TicketData.find(record => record.key_name === "marca");
          if(record){
            await record.update({ value: marca });
          }else{
            eventData.TicketData = await TicketService.agregarInformacionExtra(eventData.Ticket.id, "marca", marca);
          }
          eventData.context.departamentreq.marca = true;
          eventData.updateRequisites();
          conversations.set(eventData.Key_Context, eventData.context);
        }
      }else{
        if(!eventData.Ticket.agent_id){
          await MessageService.EnviarMensaje(
            eventData.Departamento,
            eventData.Ticket,
            new whatsappMessage(eventData.Ticket.wa_id)
              .createTextMessage("Mis disculpas, no entendí tu solicitud. Por favor, escribe 'menu' para obtener más opciones.")
          );
        }        
      }
      break;
  }
  
  for(var requisito in eventData.context.requisitos){
    console.log(requisito)
    if(!eventData.context.requisitos[requisito]){
      for(var rv in eventData.context[requisito]){
        if(!eventData.context[requisito][rv]){
          if(requisito == "departamentreq"){
            console.log(rv);
            if(rv === "marca"){
              let msgobject = new messageObject("Menu", "list");
              let marcas = await db.MenuVehiculos.findAll({
                where: {
                  padre: 0
                }
              });
              for(let marca of marcas){
                msgobject.addRow(marca.nombre, `${keyReply}_req_marca_${marca.nombre}`);
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
            }else if(rv === "modelo" && eventData.context[requisito]["marca"]){
              await GenerarMenu(eventData);
              return;
            }
          } 
          if(requisito == "userdata"){
            if(rv === "full_name"){
              /*
              eventData.context.enproceso = "full_name";
              await MessageService.EnviarMensaje(
                eventData.Departamento,
                eventData.Ticket,
                new whatsappMessage(eventData.Ticket.wa_id)
                .createTextMessage("Mis disculpas, no entendí tu solicitud. Por favor, escribe 'menu' para obtener más opciones.")
              );
              */
            }
            if(rv === "email"){
              
            }
          }
          if(requisito == "ticketreq"){
            
          }
        }
      }
    }
  }
  
  
  
};


async function GenerarMenu(eventData){
  console.log(eventData.context.reply);
  //entData.context.reply
  if(eventData.context.reply.includes(`${keyReply}_menu_`)){
    let id = Number(eventData.context.reply.replace(`${keyReply}_menu_`, ''));
    console.log(id);
    if (!isNaN(id)){
      let msgobject = new messageObject("Menu", "list");
      let opciones = await db.MenuVehiculos.findAll({
        where: {
          padre: id
        }
      });
      for(let o of opciones){
        msgobject.addRow(o.nombre, `${keyReply}_menu_${o.id}`);
      }
      msgobject.addRow("Ejecutivo" `${keyReply}_menu_ejecutivo`);
      msgobject.addRow("Oportunidades" `${keyReply}_menu_oportunidades`);
      
      await MessageService.EnviarMensaje(
        eventData.Departamento,
        eventData.Ticket,
        new whatsappMessage(eventData.Ticket.wa_id).createInteractiveMessage(
          new messageInteractive("list").addBody("Por favor seleccione una opción").addFooter("RSAsist Menu").addAction(
            new messageAction("list").addButton("Menu").addSection(msgobject.toJSON()).toJSON()
          ).toJSON()
        )
      );
      
    }else{
      console.log("aqui carga");
    }
  }else{
    let marca_entity = eventData.TicketData.find(record => record.key_name === "marca");
    let marca = await db.MenuVehiculos.findOne({
      where: Sequelize.where(
        Sequelize.fn('lower', Sequelize.col('nombre')),
        Sequelize.fn('lower', marca_entity.value)
      )
    });
    eventData.context.reply = `${keyReply}_menu_${marca.id}`;
    await GenerarMenu(eventData);
  }

}