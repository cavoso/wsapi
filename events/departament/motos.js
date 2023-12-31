const db = require('../../models');
const { Sequelize, Op } = require('sequelize');
const {  WSProc, moment, regex, delay, TsToDateString  } = require('../../utils');
const { ClienteService, TicketService, MessageService } = require('../../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../../lib');

const keyReply = "8fK2s";

module.exports = async function evento(response, eventData, conversations, message, listTicket) {
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
    case 'Menu':
      await GenerarMenu(eventData);
      return;
      break;
    default:
      if(eventData.context.reply !== ""){
        const [iddep, sec, tipo, id] = eventData.context.reply.split("_");
        
        switch(sec){
          case 'menu':
            
            switch(tipo){
              case 'marca':
                
                let marcaEntity = eventData.TicketData.find(record => record.key_name === "marca");
                if(marcaEntity){
                  await MessageService.EnviarMensaje(
                    eventData.Departamento,
                    eventData.Ticket,
                    new whatsappMessage(eventData.Ticket.wa_id)
                    .createInteractiveMessage(
                      new messageInteractive("button")
                      .addBody(`La marca ${marcaEntity.value} está registrada. ¿Prefieres cambiar a ${id}?`)
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
                if(modelo_entity){
                  await MessageService.EnviarMensaje(
                    eventData.Departamento,
                    eventData.Ticket,
                    new whatsappMessage(eventData.Ticket.wa_id)
                    .createInteractiveMessage(
                      new messageInteractive("button").addBody(`El modelo ${modelo_entity.value} está registrada. ¿Prefieres cambiar a ${id}?`)
                      .addFooter("RSAsist Menu")
                      .addAction(
                        new messageAction("button")
                          .addButton(`Si`, `${keyReply}_cambiar_modelo_${id}`)
                          .addButton(`No`, `${keyReply}_nocambiar_modelo_${modelo_entity.value}`)
                          .toJSON()
                        )
                        .toJSON()
                    )
                );
              }else{
                eventData.TicketData = await TicketService.agregarInformacionExtra(eventData.Ticket.id, "modelo", id);
                eventData.context.departamentreq.modelo = true;
                eventData.context.reply = ""; 
                eventData.updateRequisites();
                conversations.set(eventData.Key_Context, eventData.context);
              }
              
              break;
              case 'agente':
                const lastTicket = await db.Ticket.findOne({
                  where: { id: id}
                });
                eventData.Ticket.update({
                  agent_id: lastTicket.agent_id,
                  status: 'IN_PROGRESS',
                  city: lastTicket.city,
                  available_to_all: true
                });
                eventData.context.ticketreq.ciudad = true;
                eventData.context.reply = ""; 
                eventData.updateRequisites();
                conversations.set(eventData.Key_Context, eventData.context);
                break;
              case 'ciudad':
                let agente = await db.Agent.findOne({
                  where: { id: id}
                });
                eventData.Ticket.update({
                  city: agente.city
                });
                eventData.context.ticketreq.ciudad = true;
                eventData.context.reply = ""; 
                eventData.updateRequisites();
                conversations.set(eventData.Key_Context, eventData.context);
                break;
            default:
              
              await GenerarMenu(eventData);
              return;
              
              break;
          }
            
            break;
          case 'cambiar':
            
            let marcaEntity = eventData.TicketData.find(record => record.key_name === "marca");
            let modeloEntity = eventData.TicketData.find(record => record.key_name === "modelo");
            
            switch(tipo){
              case 'marca':
                
                marcaEntity.update({key_name: "marca_cambiada"});
                eventData.context.departamentreq.marca = false;
                
                if(modeloEntity){
                  modeloEntity.update({key_name: "modelo_cambiada"});
                  eventData.context.departamentreq.modelo = false;
                }
                
                eventData.context.reply = ""; 
                eventData.updateRequisites();
                conversations.set(eventData.Key_Context, eventData.context);
                break;
              case 'modelo':

                modeloEntity.update({key_name: "modelo_cambiada"});
                eventData.context.departamentreq.modelo = false;
                eventData.context.reply = ""; 
                eventData.updateRequisites();
                conversations.set(eventData.Key_Context, eventData.context);
                break;
            }
            
            break;
          default:
            break;
        }
        
        if(eventData.context.reply.includes(`${keyReply}_menu_`)){

        }else if(eventData.context.reply.includes(`${keyReply}_cambiar`)){
          
        }else{
          
        }
      }else{
        if(eventData.context.enproceso != ""){
          switch(eventData.context.enproceso){
            case "full_name":              
              eventData.Cliente.update({full_name: response.utterance});  
              eventData.context.userdata.full_name = true;
              break;
            case "email":              
              eventData.Cliente.update({email: response.utterance});
              eventData.context.userdata.email = true;
              break;
          }
          eventData.context.enproceso = "";
          eventData.updateRequisites();
          conversations.set(eventData.Key_Context, eventData.context);
        }else{
          if(eventData.Ticket.status === 'OPEN'){
            await MessageService.EnviarMensaje(
              eventData.Departamento,
              eventData.Ticket,
              new whatsappMessage(eventData.Ticket.wa_id)
              .createTextMessage("Lo siento, no entiendo tu mensaje")
            );
          }
        }
      }
      break;
  }
   
  for(var requisito in eventData.context.requisitos){
    if(!eventData.context.requisitos[requisito]){
      for(var rv in eventData.context[requisito]){
        if(!eventData.context[requisito][rv]){
          if(requisito == "departamentreq"){
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
              
              eventData.context.enproceso = "full_name";
              await MessageService.EnviarMensaje(
                eventData.Departamento,
                eventData.Ticket,
                new whatsappMessage(eventData.Ticket.wa_id)
                .createTextMessage("Para mejorar la atención, por favor ingrese su nombre")
              );
              return;
            }
            if(rv === "email"){
              eventData.context.enproceso = "email";
              await MessageService.EnviarMensaje(
                eventData.Departamento,
                eventData.Ticket,
                new whatsappMessage(eventData.Ticket.wa_id)
                .createTextMessage("Para mejorar la atención, por favor ingrese su email")
              );
              return;
            }
          }
          if(requisito == "ticketreq"){
            if(rv === "ciudad"){
              var count = await db.Ticket.count({
                department_id: eventData.Ticket.department_id,
                wa_id: eventData.Ticket.wa_id
              });
              if(count > 1){
                const lastTicket = await db.Ticket.findOne({
                  where: {
                    department_id: eventData.Ticket.department_id,
                    wa_id: eventData.Ticket.wa_id,
                    id: {
                      [Op.lt]: eventData.Ticket.id
                    }
                  },
                  order: [['id', 'DESC']]
                });
                await MessageService.EnviarMensaje(
                  eventData.Departamento,
                  eventData.Ticket,
                  new whatsappMessage(eventData.Ticket.wa_id)
                  .createInteractiveMessage(
                    new messageInteractive("button").addBody(`¿Desea ser atendido por el ultimo agente que lo atendió?`)
                    .addFooter("RSAsist Menu")
                    .addAction(
                      new messageAction("button")
                      .addButton(`Si`, `${keyReply}_menu_agente_${lastTicket.id}`)
                      .addButton(`No`, `${keyReply}_no`)
                      .toJSON()
                    )
                    .toJSON()
                  )
                );
                return;
              }else{
                await GenerarListadoCiudad(eventData);
                return;
              }

            }
          }
        }
      }
    }
  }
  
  if(
    eventData.context.requisitos.departamentreq == true &&
    eventData.context.requisitos.userdata == true &&
    eventData.context.requisitos.ticketreq == true
  ){
    if(eventData.Ticket.status === 'OPEN'){
        if (!listTicket.includes(eventData.Ticket.id)){
          eventData.Ticket.update({
            status : 'IN_PROGRESS',
            updated_at: db.sequelize.literal('NOW()')
          });
          //listTicket.push(eventData.Ticket.id);
          await MessageService.EnviarMensaje(
            eventData.Departamento,
            eventData.Ticket,
            new whatsappMessage(eventData.Ticket.wa_id)
            .createTextMessage("Uno de nuestros operadores se comunicará con usted, por favor espere")
          );
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

  if(modelo_entity === undefined){
    if(eventData.context.reply.includes(`${keyReply}_menu_`)){
      const [iddep, sec, tipo, id] = eventData.context.reply.split("_");

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
  }else{
    enviar = true;
  }
  
  
  if(enviar){
    let menu_title = "Menu";
    if(modelo_entity === undefined){
      menu_title = "Otras Opciones";
    }else{
      titulo = "una opcion";
    }
    let ticket_menu = new messageObject(menu_title, "list");
    ticket_menu.addRow("Contactar Ejecutivo", `${keyReply}_menu_general_ejecutivo`);
    if(!modelo_entity){
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

async function GenerarListadoCiudad(eventData){
  
  let _Action = new messageAction("list").addButton("Ver Ciudades");
  let sec_menu = new messageObject("Ciudades", "list");
  
  let ciudades = await db.Agent.findAll({
    attributes: ['id', 'city'],
    raw: true,
    group: ['city']
  });
  console.log(ciudades)
  for(let c of ciudades){
    sec_menu.addRow(c.city, `${keyReply}_menu_ciudad_${c.id}`);
  }
  
  _Action.addSection(sec_menu.toJSON());
  
  await MessageService.EnviarMensaje(
      eventData.Departamento,
      eventData.Ticket,
      new whatsappMessage(eventData.Ticket.wa_id).createInteractiveMessage(
        new messageInteractive("list").addBody(`Por favor seleccione la ciudad mas cercana a usted para buscar el agente más cercano a usted.`).addFooter("RSAsist Menu").addAction(
          _Action.toJSON()
        ).toJSON()
      )
    );
}