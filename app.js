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


const db = require('./models');
const TicketService = require('./services/ticketService');
const ClienteService = require('./services/clienteService');
const MensajeService = require('./services/mensajesService');


// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
  //console.log(JSON.stringify(value, null, 2));
  const Ticket = null;
  const entry = req.body.entry[0];
  const change = entry.changes[0];
  if (change.field === "contacts"){
    const Cliente = await ClienteService.crearClienteSiNoExiste(change.value.contacts[0].wa_id, change.value.contacts[0].profile.name);
    Ticket = await TicketService.buscarOCrearTicket(change.value.contacts[0].wa_id);
  }
  if (change.field === "messages" && !Ticket) {
    const message = change.value.messages[0];
    if (message.type === "text") {
      // Es un mensaje de texto enviado por el cliente
      const text = message.text.body;
      console.log(text)

      
    } else if (message.type === "image") {
      // Es un mensaje de imagen enviado por el cliente
      const imageUrl = message.image.url;
      // Hacer algo con la imagen
    } else {
      // Otro tipo de mensaje enviado por el cliente
      // Hacer algo con el mensaje
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
