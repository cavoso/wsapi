const db = require('../../models');
const Sequelize = require('sequelize');
const { variablesMenu } = require('../../config/validaciones');
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
        }else if(eventData.context.reply.includes(`${keyReply}_menu_`)){
          if(eventData.context.reply != ""){
            const { iddep, tipo, id } = variablesMenu(eventData.context.reply);
            if(tipo == "modelo"){
              let modelo = await db.MenuVehiculos.findOne({
                where: {
                  id: id
                }
              });
              eventData.TicketData = await TicketService.agregarInformacionExtra(eventData.Ticket.id, "modelo", modelo.nombre);
              eventData.context.departamentreq.modelo = true;
              eventData.updateRequisites();
              conversations.set(eventData.Key_Context, eventData.context);
            }
          }else{
            await GenerarMenu(eventData);
            return;
          }          
          
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
              await GenerarMenu(eventData);
              return;              
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
  
  let marca_entity = eventData.TicketData.find(record => record.key_name === "marca");
  let modelo_entity = eventData.TicketData.find(record => record.key_name === "modelo");
  
  let titulo = "";
  let _Action = new messageAction("list").addButton("Menu");
  
  let opciones = null;
  
  if(eventData.context.reply.includes(`${keyReply}_menu_`)){
    
  }else{
    titulo = "una marca";
    if(!marca_entity){
      opciones = await db.MenuVehiculos.findAll({
        where: {
          categoria: "marca"
        }
      });      
    }else{
      let marca = await db.MenuVehiculos.findOne({
        where: Sequelize.where(
          Sequelize.fn('lower', Sequelize.col('nombre')),
          Sequelize.fn('lower', marca_entity.value)
        )
      });
    }
  }
  for(let o of opciones){
    msgobject.addRow(o.nombre, `${keyReply}_req_${o.categoria}_${o.nombre}`);
  }
  _Action.addSection(msgobject);
  _Action.addSection(
    new messageObject("Otras Opciones", "list")
      .addRow("Contactar Ejecutivo", `${keyReply}_menu_general_ejecutivo`)
      .addRow("Oportunidades",`${keyReply}_menu_general_oportunidades`)
    .toJSON()
  );

  await MessageService.EnviarMensaje(
    eventData.Departamento,
    eventData.Ticket,
    new whatsappMessage(eventData.Ticket.wa_id).createInteractiveMessage(
      new messageInteractive("list").addBody(`Por favor seleccione ${titulo}, clic en menú para abrirlo`).addFooter("RSAsist Menu").addAction(
        _Action.toJSON()
      ).toJSON()
    )
  );
 
}