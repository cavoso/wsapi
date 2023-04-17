/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */

"use strict";

// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
const token = process.env.WHATSAPP_TOKEN;
const phone_number = process.env.PHONE_NUMBER;
const phone_number_id = process.env.PHONE_NUMBER_ID;
const maxhours = 1;

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  app = express().use(body_parser.json()); // creates express http server
const moment = require('moment');
const nlp = require('./nlp/index');

const db = require('./models');
const TicketService = require('./services/ticketService');
const ClienteService = require('./services/clienteService');
const MensajeService = require('./services/mensajesService');
const sucursales = require('./nlp/intents/Sucursales');
const validacion = require('./config/validaciones');


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const conversations = new Map();

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  let body = req.body;
  const entry = req.body.entry[0];
  const change = entry.changes[0];
  
  if("statuses" in change.value){
    let mensaje = await db.TicketMensajes.findOne({ where: { wamid: change.value.statuses[0].id } });
    mensaje.update({status: change.value.statuses[0].status});
  }else{
    
    let waid = null;
    let Cliente = null;
    let Ticket = null;
    
    if ("contacts" in change.value){
      waid = change.value.contacts[0].wa_id;
      Cliente = await ClienteService.crearClienteSiNoExiste(waid, change.value.contacts[0].profile.name);
      Ticket = await TicketService.buscarOCrearTicket(waid); 
    }
    
    let context = conversations.get(waid);
    if (!context){
      context = {};
      conversations.set(waid, context);
    }
    
    context.ticket = Ticket;
    conversations.set(waid, context);
    
    if ("messages" in change.value){
      
      const message = change.value.messages[0];
      let date = new Date(parseInt(message.timestamp) * 1000);
      let mysqlDatetimeString = date.toISOString().slice(0, 19).replace('T', ' ');
      
      await TicketService.agregarMensaje({
        ticket: Ticket.id,
        waid: change.value.contacts[0].wa_id,
        wamid: message.id,
        timestamp: mysqlDatetimeString,
        type: message.type,
        message: JSON.stringify(message)
      });
      Ticket.update({ultimomensaje: db.sequelize.literal('NOW()')});
      
      let text = "";
      if (message.type === "text") {
        text = message.text.body;
      }else if(message.type === "interactive"){
        if(message.interactive.type === "list_reply"){
          text = message.interactive.list_reply.title;
        }
      }
      
      let response = await nlp.process('es', text, context);
      console.log(response)
      
      if(response.intent == "Saludo"){
        const creadoEl = moment(Ticket.creadoel);
        if(moment().diff(creadoEl, 'minutes') >= 1){
          await MensajeService.MSGText(Ticket, "¡Hola! ¡Bienvenido a RS-Shop!");
        }else{
          await MensajeService.MSGText(Ticket, response.answer);
          await delay(2000);
          await MensajeService.botMensaje(Ticket);
        }
      }
      
    }
    
  }
  
  res.sendStatus(200);
  
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
app.get("/webhook", (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
  **/
  const verify_token = process.env.VERIFY_TOKEN;
  

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
