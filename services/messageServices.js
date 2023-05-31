const sequelize = require('sequelize');
const axios = require("axios").default;
const TicketService = require('./ticketServices');
const safeJsonFormatter = require('restify-safe-json-formatter');

const token = process.env.WHATSAPP_TOKEN;

function EnviarMensaje(departamento, ticket, msg){
  //console.log(JSON.stringify(msg, null, 2));
  axios({
    method : "POST",
    url : "https://graph.facebook.com/v16.0/" + departamento.phone_number_id + "/messages?access_token=" + token,
    data: msg,
    headers: { "Content-Type": "application/json" },
  }).then(async (result) => {
    let data = result.data;
    //console.log(JSON.stringify(data, null, 2));
    let date = new Date();
    let mysqlDatetimeString = date.toISOString().slice(0, 19).replace('T', ' ');
    console.log(safeJsonFormatter(msg))
    await TicketService.agregarMensaje(ticket, {
        ticket_id: ticket.id,
        wamid: data.messages[0].id,
        content: safeJsonFormatter(msg),
        direction: "OUTGOING",
        created_at: mysqlDatetimeString
      });
    ticket.update({last_updated_message_at: sequelize.literal('NOW()')});
  }).catch((error) => {
    //console.log(JSON.stringify(error, null, 2));
    console.log(error);
  });
}

module.exports = {
  EnviarMensaje
};