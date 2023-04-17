const { sequelize } = require('sequelize');
const db = require('../models');
const axios = require("axios").default;
const TicketService = require('./ticketService');
const sucursales = require('../nlp/intents/Sucursales');

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
      msg.interactive.header.text = "";
      msg.interactive.body.text = "Por favor seleccione el departamento con el cual desea contactar";
      msg.interactive.footer.text = "Bot RS";
      msg.interactive.action.button = "Sel. departamento";
      msg.interactive.action.sections[0].title = "Departamentos";
      
      EnviarMensaje(Ticket, msg);
      
      return;
    }else if (!Ticket.sucursal) {
      msg.interactive.action.sections[0].rows = [];
      
      for(const suc of sucursales.documents){
        
        if(Ticket.departamento == 'Taller'){
          if(suc.id !== 3){
            msg.interactive.action.sections[0].rows.push({
              "id": suc.id,
              "title": suc.input
            });
          }
        }else if(Ticket.departamento == 'Venta Motos'){
          if(suc.id !== 6){
            msg.interactive.action.sections[0].rows.push({
              "id": suc.id,
              "title": suc.input
            });
          }
        }else{
          msg.interactive.action.sections[0].rows.push({
            "id": suc.id,
            "title": suc.input
          });
        }
      }

      msg.interactive.header.text = "";
      msg.interactive.body.text = "Por favor seleccione la sucursal más cercana a su ubicación";
      msg.interactive.footer.text = "Bot RS";
      msg.interactive.action.button = "Sel. Sucursal";
      msg.interactive.action.sections[0].title = "Sucursales";
      
      EnviarMensaje(Ticket, msg);
      
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
    //console.log(JSON.stringify(data, null, 2));
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
    ticket.update({ultimomensaje: sequelize.literal('NOW()')});
  }).catch((error) => {
    console.log(JSON.stringify(error, null, 2));
  });
}

function MSGText(Ticket, texto){
   let msg = {
      messaging_product: "whatsapp",
      to: Ticket.waid,
      type: "text",
      text: {
        preview_url: false,
        body: texto
      }
    };
  EnviarMensaje(Ticket, msg);
}
function MSGBotones(Ticket, texto, botones){
   let msg = {
      messaging_product: "whatsapp",
      to: Ticket.waid,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: texto
        },
        action: {
          buttons: botones
        }
      }
    };
  EnviarMensaje(Ticket, msg);
}

function GetButtonReplyFormat(id, texto){
  return {
    type: "reply",
    reply: {
      id: id,
      title: texto
    }
  };
}

async function getLocationFromCoordinates(coordinates, field) {
  const { latitude, longitude } = coordinates;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.results.length > 0) {
      const addressComponents = response.data.results[0].address_components;
      const result = addressComponents.find(component => component.types.includes(field));
      return result ? result.long_name : null;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}


module.exports = {
  botMensaje,
  MSGText,
  MSGBotones,
  GetButtonReplyFormat,
  getLocationFromCoordinates
};