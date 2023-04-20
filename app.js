"use strict";

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  app = express().use(body_parser.json()); // creates express http server
const moment = require('moment');
const nlp = require('./nlp/index');

const db = require('./models');
const validacion = require('./config/validaciones');
const utils = require('./utils');

const ClienteService = require('./services/clienteServices');


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const conversations = new Map();

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  let body = req.body;
  const datos = utils.WSProc(body);
  console.log(JSON.stringify(datos, null, 2));
  
  if("statuses" in datos){
    //aqui se actualizan los estados de los mensajes

  }else{
    //aqui se procesan los mensajes
    let waid = null;
    let Departamento = null;
    let Cliente = null;
    let Ticket = null;
    
    if("metadata" in datos){
      Departamento = await db.Department.findOne({ where: { phone_number: datos.metadata.display_phone_number, phone_number_id: datos.metadata.phone_number_id } });
    }
    if ("contacts" in datos){
      waid = datos.contacts[0].wa_id;
      Cliente = await ClienteService.crearClienteSiNoExiste(waid, datos.contacts[0].profile.name);
      Ticket = await TicketService.buscarOCrearTicket(waid);
    }
    
    let context = conversations.get(waid);
    if (!context){
      context = {};
      conversations.set(waid, context);
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
