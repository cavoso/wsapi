const { ClienteService, TicketService, MessageService } = require('../services');

module.exports = async function evento(eventData, data) {
  console.log(JSON.stringify(data, null, 2));
  
  let wa_id = data.wa_id;
  eventData.KeyContext = `${wa_id}_${eventData.Departamento.id}`;
  eventData.Cliente = await ClienteService.crearClienteSiNoExiste(wa_id, data.profile.name);
  const [ticketInstance, ticketCreated] = await TicketService.buscarOCrearTicket(wa_id, eventData.Departamento.id);
  eventData.Ticket = ticketInstance;
};