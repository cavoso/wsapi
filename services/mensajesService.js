const db = require('../models');
const axios = require("axios").default;
const TicketService = require('./ticketService');

const token = process.env.WHATSAPP_TOKEN;
const phone_number = process.env.PHONE_NUMBER;
const phone_number_id = process.env.PHONE_NUMBER_ID;

async function botMensaje(Ticket){
  try{
    let msg = {
      messaging_product: "whatsapp",
      to: Ticket.waid,
      type: "interactive",
      interactive: {
        type: "list",
        header: {
          type: "text",
          text: ""
        },
        body: {
          text: ""
        },
        footer: {
          text: ""
        },
        action: {
          button: "",
          sections: [
            {
              title: "",
              rows: []
            }
          ]
        }
      }
    };
    if (!Ticket.departamento) {
      const departamentos = await db.Departamento.findAll();
      for (const departamento of departamentos) {
        msg.interactive.action.sections[0].rows.push({
          "id": departamento.id,
          "title": departamento.nombre
        });
      }
      msg.interactive.header.text = "Bienvenido a RS-Shop";
      msg.interactive.body.text = "Por favor seleccione el departamento con el cual desea contactar";
      msg.interactive.footer.text = "Bot RS";
      msg.interactive.action.button = "Sel. departamento";
      msg.interactive.action.sections[0].title = "Departamentos";
      
      EnviarMensaje(Ticket, msg);
      
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
        type: msg.type,
        message: JSON.stringify(msg[msg.type])
      });
  }).catch((error) => {
    console.log(error);
  });
}

module.exports = {
  botMensaje
};