const { ClienteService, TicketService, MessageService } = require('../services');
const db = require('../models');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../lib');

module.exports = async function evento(eventData, conversations, data) {
  
  let wa_id = data.wa_id;
  eventData.KeyContext = `${wa_id}_${eventData.Departamento.id}`;
  eventData.Cliente = await ClienteService.crearClienteSiNoExiste(wa_id, data.profile.name);
  const [ticketInstance, ticketCreated] = await TicketService.buscarOCrearTicket(wa_id, eventData.Departamento.id);
  eventData.Ticket = ticketInstance;
  eventData.TicketData = await db.AdditionalInfo.findAll({
    where: {
      ticket_id: eventData.Ticket.id
    }
  });
  eventData.context = conversations.get(eventData.Key_Context);

  if (!eventData.context || ticketCreated){
    eventData.context = {
      enproceso: "",
      saludobot: false,
      requisitos: {
        userdata: false,
        departamentreq: false,
        ticketreq: false
      },
      userdata: {
        full_name: !eventData.Cliente.full_name,
        email: !eventData.Cliente.email,
      },
      departamentreq: {},
      ticketreq: {
        ciudad: false
      }
    };
    for(const xreq of eventData.TicketData){
      eventData.context.departamentreq[xreq.key_name] = false;
    }
    conversations.set(eventData.Key_Context, eventData.context);
  }
  if(ticketCreated){
    let msg = new whatsappMessage(wa_id).createTextMessage(`Ticket creado exitosamente. ID asignado: ${String(eventData.Ticket.id).padStart(5, '0')}.`);
    await MessageService.EnviarMensaje(eventData.Departamento, eventData.Ticket, msg);
  }
};