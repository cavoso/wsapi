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

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  app = express().use(body_parser.json()); // creates express http server

const TicketService = require('./services/ticketService');
const ClienteService = require('./services/clienteService');
const MensajeService = require('./services/mensajesService');

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
  const value = body.entry[0].changes[0].value;
  //console.log(JSON.stringify(value, null, 2));
  
  if("contacts" in value){
    //el mensaje fue enviado por el cliente
    
    //Obtenemos al cliente, si no existe se creara automaticamente
    const Cliente = await ClienteService.crearClienteSiNoExiste(value.contacts[0].wa_id, value.contacts[0].profile.name);
    
    const Ticket = await TicketService.buscarOCrearTicket(value.contacts[0].wa_id);
    
    if("messages" in value){
      let date = new Date(parseInt(value.messages[0].timestamp) * 1000);
      let mysqlDatetimeString = date.toISOString().slice(0, 19).replace('T', ' ');
      
      await TicketService.agregarMensaje({
        ticket: Ticket.id,
        waid: value.contacts[0].wa_id,
        wamid: value.messages[0].id,
        timestamp: mysqlDatetimeString,
        type: value.messages[0].type,
        message: JSON.stringify(value.messages[0][value.messages[0].type])
      });
    }
    
    if(!Ticket.departamento || !Ticket.sucursal){
      await MensajeService.botMensaje(Ticket);
    }
  }
  
  if("statuses" in value){
    //corresponde a un mensaje de status, sobre el estado de otro mensaje
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
