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
const conversations = new Map();

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {

  // Parse the request body from the POST
  let body = req.body;
  //console.log(JSON.stringify(body, null, 2));
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
      
      if(Ticket.inbot == 1){
        let text = "";
        
        if (message.type === "text") {
          text = message.text.body;
        }else if(message.type === "interactive"){
          if(message.interactive.type === "list_reply"){
            text = message.interactive.list_reply.title;
          }
        }
        
        let response = await nlp.process('es', text, context);
        
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
          console.log(response)
          console.log(context)
          if(context.pendNombre){
            console.log(response)
          }else{
            await MensajeService.MSGText(Ticket, "Lo siento, no puedo entender este tipo de mensaje.");
          }
          
        }
        
        if(Ticket.status == 'PENDIENTE'){
          if(Ticket.departamento && Ticket.sucursal){
            Ticket.update({status: 'ACTIVO'});
            await MensajeService.MSGText(Ticket, "se creo su ticket exitosamente");
            await delay(2000);
          }
        }
        if(Ticket.status == 'ACTIVO'){
          if (!context.pendingData) {
            // Inicializar el objeto pendingData con los datos personales pendientes
            context.pendingData = {
              nombres: !Cliente.nombres,
              paterno: !Cliente.paterno,
              materno: !Cliente.materno,
              email: !Cliente.email,
              ciudad: !Cliente.ciudad,
            };
            await MensajeService.MSGText(Ticket, "");
          }
          
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
