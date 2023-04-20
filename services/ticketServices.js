const db = require('../models');
const { Op } = require('sequelize');

async function buscarOCrearTicket(waid) {
  try {
    // Buscar un ticket existente con el waid y estado no finalizado
    const ticket = await db.Ticket.findOrCreate({
      where: { waid, status: { [Op.ne]: 'CLOSED' } },
      defaults: { waid, status: 'OPEN'}
    });
    // Devolver el objeto ticket (tanto si ya existía como si se acaba de crear)
    return ticket[0];
  } catch (error) {
    console.log(error);
  }
}

async function agregarMensaje(datos) {
  try {
    const mensajeCreado = await db.TicketMensajes.create(datos);
    return mensajeCreado;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  buscarOCrearTicket,
  agregarMensaje
};