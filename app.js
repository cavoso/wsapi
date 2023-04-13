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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {

  const maxhours = 1;
  // Parse the request body from the POST
  let body = req.body;
  //console.log(JSON.stringify(body, null, 2));
  const entry = req.body.entry[0];
  const change = entry.changes[0];
  if ("contacts" in change.value){
    const Cliente = await ClienteService.crearClienteSiNoExiste(change.value.contacts[0].wa_id, change.value.contacts[0].profile.name);
    const Ticket = await TicketService.buscarOCrearTicket(change.value.contacts[0].wa_id);
    const diffHoras = moment().diff(Ticket.ultimomensaje, 'hours'); 
    if ("messages" in change.value) {
      const message = change.value.messages[0];
      
      let date = new Date(parseInt(message.timestamp) * 1000);
      let mysqlDatetimeString = date.toISOString().slice(0, 19).replace('T', ' ');
      
      await TicketService.agregarMensaje({
        ticket: Ticket.id,
        waid: change.value.contacts[0].wa_id,
        wamid: message.id,
        timestamp: mysqlDatetimeString,
        type: message.type,
        message: JSON.stringify(message[message.type])
      });
      
      if(diffHoras >= maxhours){
        await MensajeService.MSGBotones(Ticket, `Tiene un Ticket abierto con el departamento ${Ticket.departamento}, ¿desea continuar con él, o desea crear uno nuevo?`, [
          MensajeService.GetButtonReplyFormat(1, "SI"),
          MensajeService.GetButtonReplyFormat(2, "No"),
        ]);
      }
      
      Ticket.update({ultimomensaje: db.sequelize.literal('NOW()')});
      
      if(Ticket.inbot == 1){
        let text = "";
        
        if (message.type === "text") {
          text = message.text.body;
        }else if(message.type === "interactive"){
          if(message.interactive.type === "list_reply"){
            text = message.interactive.list_reply.title;
          }
        }
        
        let response = await nlp.process('es', text);
        console.log(response);
        
        if(response.intent == "Saludo"){
          await MensajeService.MSGText(Ticket, response.answer);
          await delay(2000);
          await MensajeService.botMensaje(Ticket);
        }else if(response.intent == "Departamento"){
          Ticket.update({departamento: response.utterance});
          await MensajeService.botMensaje(Ticket);
        }else if(response.intent == "Sucursal"){
          const checksucursal = sucursales.documents.find((sucursal) => sucursal.input === response.utterance);
          if(checksucursal){
            Ticket.update({sucursal: checksucursal.id});
          }
          
          //await MensajeService.MSGText(Ticket, "Su ticket se ha creado exitosamente, uno de nuestros agentes se conectará pronto");
        }else{
          await MensajeService.MSGText(Ticket, "Lo siento, no puedo entender este tipo de mensaje.");
        }
        
      }else{
        //esto aplica si no hay esta activo el bot para el ticket
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
