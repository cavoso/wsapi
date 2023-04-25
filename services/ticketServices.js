const db = require('../models');
const { Op } = require('sequelize');

async function buscarOCrearTicket(waid, deptoid) {
  try {
    // Buscar un ticket existente con el waid y estado no finalizado
    const ticket = await db.Ticket.findOrCreate({
      where: { wa_id: waid, department_id: deptoid, status: { [Op.ne]: 'CLOSED' } },
      defaults: { wa_id: waid, status: 'OPEN'}
    });
    // Devolver el objeto ticket (tanto si ya existía como si se acaba de crear)
    return ticket;
  } catch (error) {
    console.log(error);
  } 
}

async function agregarMensaje(Ticket, datos) {
  try {
    const mensajeCreado = await db.Message.create(datos);
    Ticket.update({last_updated_message_at: db.sequelize.literal('NOW()')});
    return mensajeCreado;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  buscarOCrearTicket,
  agregarMensaje
};