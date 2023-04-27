const db = require('../models');
const { WSProc, moment, regex, delay, TsToDateString } = require('../utils');
const { ClienteService, TicketService, MessageService } = require('../services');
const { whatsappMessage, messageInteractive, messageAction, messageObject, templateComponent } = require('../lib');

const clientTicketMiddleware = async (req, res, next) => {
  
  const datos = WSProc(req.body);
  
  if ("contacts" in datos){
      //aqui se revisa y crea el cliente y el ticket, en caso de que el ticket se cree, se envia un mensaje notificando al cliente de que se a creado un ticket
      req.app.waid = datos.contacts[0].wa_id;
      req.app.Cliente = await ClienteService.crearClienteSiNoExiste(req.app.waid, datos.contacts[0].profile.name);
      const TicketCheck = await TicketService.buscarOCrearTicket(req.app.waid, req.app.Departamento.id);
      req.app.Key_Context = `${req.app.waid}_${req.app.Departamento.id}`;
      req.app.context = req.app.conversations.get(req.app.Key_Context);
      if (!req.app.context){
        req.app.context = {
          enproceso: "",
          requisitos: {
            userdata: false,
            departamentreq: false,
            ticketreq: false
          }
          userdata: {
            full_name: !req.app.Cliente.full_name,
            email: !req.app.Cliente.email,
          },
          
        };
        req.app.conversations.set(req.app.Key_Context, req.app.context);
      }
      req.app.Ticket = TicketCheck[0];
      req.app.TicketData = await db.AdditionalInfo.findAll({
        where: {
          ticket_id: req.app.Ticket.id
        }
      });
      
      if(TicketCheck[1]){
        req.app.context = {};
        req.app.conversations.set(req.app.Key_Context, req.app.context);
        let msg = new whatsappMessage(req.app.Ticket.wa_id).createTextMessage(`Ticket creado exitosamente. ID asignado: ${String(req.app.Ticket.id).padStart(7, '0')}.`);      
        MessageService.EnviarMensaje(req.app.Departamento, req.app.Ticket, msg)
      }
    }

  // Pasa al siguiente middleware
  next();
};

module.exports = clientTicketMiddleware;
