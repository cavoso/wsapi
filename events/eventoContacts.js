const { ClienteService, TicketService, MessageService } = require('../services');
const db = require('../models');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../lib');

module.exports = async function evento(eventData, conversations, data) {
  
  let wa_id = data.wa_id;
  eventData.KeyContext = `${wa_id}_${eventData.Departamento.id}`;
  eventData.context = conversations.get(eventData.Key_Context);
  if (!eventData.context){
    eventData.context = {
      enproceso: "",
      saludobot: false,
      reply: '',
      requisitos: {
        departamentreq: false,
        userdata: false,        
        ticketreq: false
      },
      userdata: {
        full_name: false,
        email: false,
      },
      departamentreq: {},
      ticketreq: {
        ciudad: false
      }
    };
    
  }
  if(!eventData.Cliente){
    eventData.Cliente = await ClienteService.crearClienteSiNoExiste(wa_id, data.profile.name);
    eventData.context.userdata.full_name = (eventData.Cliente.full_name ? true : false);
    eventData.context.userdata.email =  (eventData.Cliente.email ? true : false);
    if(eventData.context.userdata.full_name && eventData.context.userdata.email){
      eventData.context.requisitos.userdata = true;
    }
  }
  if(!eventData.Ticket){
    const [ticketInstance, ticketCreated] = await TicketService.buscarOCrearTicket(wa_id, eventData.Departamento.id);
    eventData.Ticket = ticketInstance;
    if(ticketCreated){
      let msg = new whatsappMessage(wa_id).createTextMessage(`Ticket creado exitosamente. ID asignado: ${String(eventData.Ticket.id).padStart(5, '0')}.`);
      await MessageService.EnviarMensaje(eventData.Departamento, eventData.Ticket, msg);
    }
  }
  if(!eventData.TicketData){
    eventData.TicketData = await db.AdditionalInfo.findAll({
      where: {
        ticket_id: eventData.Ticket.id
      }
    });
  }
  if(Object.keys(eventData.context.departamentreq).length === 0){
    for (const xreq of eventData.Departamento.entity) {
      eventData.context.departamentreq[xreq] = eventData.TicketData.some(additionalInfo => additionalInfo.key_name === xreq);
    }
  }  
  conversations.set(eventData.Key_Context, eventData.context);
  eventData.updateRequisites = function() {
    this.context.requisitos.userdata = this.context.userdata.full_name && this.context.userdata.email;
    let isDepartmentReqSatisfied = true;
    for (const key in this.context.departamentreq) {
      if (this.context.departamentreq.hasOwnProperty(key)) {
        if (!this.context.departamentreq[key]) {
          isDepartmentReqSatisfied = false;
          break;
        }
      }
    }
    this.context.requisitos.departamentreq = isDepartmentReqSatisfied;
    this.context.requisitos.ticketreq = this.context.ticketreq.ciudad;
  };
  
};