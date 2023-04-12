const db = require('../models');
const axios = require("axios").default;
const TicketService = require('./ticketService');

const token = process.env.WHATSAPP_TOKEN;
const phone_number = process.env.PHONE_NUMBER;
const phone_number_id = process.env.PHONE_NUMBER_ID;

function botMensaje(Ticket){
  try{
    if (!Ticket.departamento) {
       return;
     }
    if (!Ticket.sucursal) {
      return;
    }
  }catch (error) {
    console.log(error);
  }
 
}

function EnviarMensaje(ticket, msg){
  axios({
    method : "POST",
    url : "https://graph.facebook.com/v16.0/" + phone_number_id + "/messages?access_token=" + token,
    data: msg,
    headers: { "Content-Type": "application/json" },
  }).then(async (result) => {
    let data = result.data;
    let date = new Date();
    let mysqlDatetimeString = date.toISOString().slice(0, 19).replace('T', ' ');
    await TicketService.agregarMensaje({
        ticket: ticket.id,
        waid: phone_number,
        wamid: data.messages[0].id,
        timestamp: mysqlDatetimeString,
        type: value.messages[0].type,
        message: JSON.stringify(value.messages[0][value.messages[0].type])
      });
    let add_message = await db.createRecord('Ticket_Mensajes', {ticket: ticket.id, waid: phone_number, wamid: data.messages[0].id, timestamp: mysqlDatetimeString,  type: msg_dep.type, message: JSON.stringify(msg_dep[msg_dep.type]) }).then((result) => result);
  }).catch((error) => {
    console.log(error);
  });
}

module.exports = {
  botMensaje
};