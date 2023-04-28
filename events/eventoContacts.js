const { ClienteService, TicketService, MessageService } = require('../services');
const db = require('../models');

module.exports = async function evento(eventData, conversations, data) {
  console.log(JSON.stringify(data, null, 2));
  
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
        req.app.conversations.set(req.app.Key_Context, req.app.context);
      }
      if(ticketCreated){
        let msg = new whatsappMessage(req.app.waid).createTextMessage(`Ticket creado exitosamente. ID asignado: ${String(req.app.Ticket.id).padStart(5, '0')}.`);      
        await MessageService.EnviarMensaje(req.app.Departamento, req.app.Ticket, msg)
      }
};