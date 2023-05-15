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
        if(eventData.context.reply.includes(`${keyReply}_menu_`)){
          console.log(eventData.context.reply);
          const { iddep, tipo, id } = variablesMenu(eventData.context.reply);
          switch(tipo){
            case 'marca':
              
              let marcaEntity = eventData.TicketData.find(record => record.key_name === "marca");
              if(marcaEntity){
                await MessageService.EnviarMensaje(
                  eventData.Departamento,
                  eventData.Ticket,
                  new whatsappMessage(eventData.Ticket.wa_id)
                    .createInteractiveMessage(
                    new messageInteractive("button").addBody(`La marca ${marcaEntity.value} está registrada. ¿Prefieres cambiar a ${id}?`)
                      .addFooter("RSAsist Menu")
                      .addAction(
                        new messageAction("button")
                          .addButton(`Si`, `${keyReply}_cambiar_marca_${id}`)
                          .addButton(`No`, `${keyReply}_nocambiar_marca_${marcaEntity.value}`)
                          .toJSON()
                        )
                        .toJSON()
                    )
                );
                eventData.context.reply = "";
                conversations.set(eventData.Key_Context, eventData.context);
                return ;
              }else{
                eventData.TicketData = await TicketService.agregarInformacionExtra(eventData.Ticket.id, "marca", id);
                eventData.context.departamentreq.marca = true;
                eventData.context.reply = ""; 
                eventData.updateRequisites();
                conversations.set(eventData.Key_Context, eventData.context);
              }
              
              break;
            case 'modelo':
              
              let modelo_entity = eventData.TicketData.find(record => record.key_name === "modelo");
              
              break;
            default:
              
              await GenerarMenu(eventData);
              return;
              
              break;
          }
        }else{
          
        }
      }else{
        
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
  
  let enviar  = false;
  
  let marca_entity = eventData.TicketData.find(record => record.key_name === "marca");
  let modelo_entity = eventData.TicketData.find(record => record.key_name === "modelo");
  
  let titulo = "";
  let _Action = new messageAction("list").addButton("Menu");
  let sec_menu = new messageObject("Menu", "list");
  if(eventData.context.reply.includes(`${keyReply}_menu_`) && !marca_entity){
    const { iddep, tipo, id } = variablesMenu(eventData.context.reply);
    console.log(id)
    if (!isNaN(Number(id))){
      let opciones = await db.MenuVehiculos.findAll({
        where: {
          padre: id
        }
      });
      for(let o of opciones){
        if(o.categoria == "modelo"){
          sec_menu.addRow(o.nombre, `${keyReply}_menu_${o.categoria}_${o.nombre}`);
        }else{
          sec_menu.addRow(o.nombre, `${keyReply}_menu_${o.categoria}_${o.id}`);
        }
        let ultimoCaracter = o.categoria.slice(-1);
        titulo = `un${ultimoCaracter !== "a" ? '' : ultimoCaracter} ${o.categoria}`;
      }
      _Action.addSection(sec_menu.toJSON());
      enviar = true;
    }else{
      
    }
    
  }else{
    if(!marca_entity){
      titulo = "una marca";
      let opciones = await db.MenuVehiculos.findAll({
        where: {
          categoria: "marca"
        }
      }); 
      
      for(let o of opciones){
        sec_menu.addRow(o.nombre, `${keyReply}_menu_${o.categoria}_${o.nombre}`);
      }
      _Action.addSection(sec_menu.toJSON());
      enviar = true;
    }else{
      let marca = await db.MenuVehiculos.findOne({
        where: Sequelize.where(
          Sequelize.fn('lower', Sequelize.col('nombre')),
          Sequelize.fn('lower', marca_entity.value)
        )
      });
      eventData.context.reply = `${keyReply}_menu_${marca.categoria}_${marca.id}`;
      await GenerarMenu(eventData);
    }
  }
  
  if(enviar){
        
    let ticket_menu = new messageObject("Otras Opciones", "list");
    ticket_menu.addRow("Contactar Ejecutivo", `${keyReply}_menu_general_ejecutivo`);
    if(modelo_entity){
      ticket_menu.addRow("Oportunidades",`${keyReply}_menu_general_oportunidades`);
    }
    if(marca_entity){
      ticket_menu.addRow("Cambiar marca", `${keyReply}_menu_cambiar_marca`);
    }
    if(modelo_entity){
      ticket_menu.addRow("Cambiar modelo", `${keyReply}_menu_cambiar_modelo`);
    }
    ticket_menu.addRow("Cerrar Ticket", `${keyReply}_menu_cerrar_ticket`);
    _Action.addSection(ticket_menu.toJSON());
    
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
 
}