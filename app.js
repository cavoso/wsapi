"use strict";

// Imports dependencies and set up http server
const request = require("request");
const express = require("express");
const body_parser = require("body-parser");
const cors = require('cors');
const app = express().use(body_parser.json()).use(cors());

const nlp = require('./nlp/index');

const db = require('./models');
const validacion = require('./config/validaciones');
const { WSProc, moment, regex, delay, TsToDateString } = require('./utils');

const ClienteService = require('./services/clienteServices');
const TicketService = require('./services/ticketServices');
const MessageService = require('./services/messageServices');

const whatsappMessage = require('./lib/whatsappMessage');
const messageInteractive = require('./lib/messageInteractive');


const conversations = new Map();


// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  
  await nlp.load('model.nlp');
   
  let body = req.body;
  const datos = WSProc(body);
  //console.log(JSON.stringify(datos, null, 2));
  
  if("statuses" in datos){
    //aqui se actualizan los estados de los mensajes

  }else{
    //aqui se procesan los mensajes
    let waid = null;
    let Departamento = null;
    let Cliente = null;
    let Ticket = null;
    let TicketData = null;
    
    if("metadata" in datos){
      Departamento = await db.Department.findOne({ where: { phone_number: datos.metadata.display_phone_number, phone_number_id: datos.metadata.phone_number_id } });
    }
    if ("contacts" in datos){
      waid = datos.contacts[0].wa_id;
      Cliente = await ClienteService.crearClienteSiNoExiste(waid, datos.contacts[0].profile.name);
      const TicketCheck = await TicketService.buscarOCrearTicket(waid, Departamento.id);
      Ticket = TicketCheck[0];
      TicketData = await db.AdditionalInfo.findAll({
        where: {
          ticket_id: Ticket.id
        }
      });
      let context = conversations.get(waid);
      if (!context){
        conversations.set(waid, {});
      }
      if(TicketCheck[0]){
        conversations.set(waid, {});
        let msg = new whatsappMessage(Ticket.wa_id).createTextMessage(`Ticket creado exitosamente. ID asignado: ${String(Ticket.id).padStart(7, '0')}.`);      
        MessageService.EnviarMensaje(Departamento, Ticket, msg)
      }
    }
    
    
    
    if ("messages" in datos){
      const message = datos.messages[0];
      //console.log(message)
      await TicketService.agregarMensaje({
        ticket_id: Ticket.id,
        wamid: message.id,
        content: JSON.stringify(message),
        direction: "INCOMING",
        created_at: TsToDateString(message.timestamp)
      });
      Ticket.update({last_updated_message_at: db.sequelize.literal('NOW()')});
      
      /*
      let msg = new whatsappMessage(Ticket.wa_id).createTextMessage("Esto es la respuesta");      
      MessageService.EnviarMensaje(Departamento, Ticket, msg)
      */
      /*
      let text = "";
      let type = message.type;
      if (type === "text") {
        text = message.text.body;
      }
      
      const urls = text.match(regex);
      if(urls){
        urls.forEach(async url => {
          await db.AdditionalInfo.create({
            ticket_id: Ticket.id,
            key_name: "url",
            value: url
          });
        });
      }
      let response = await nlp.process('es', text, context);      
      //console.log(JSON.stringify(response, null, 2));
      //response.intent
      //response.entities
      Departamento.entity.forEach(async (xentity) => {
        const marcaEntity = response.entities.find(entity => entity.entity === xentity);
        const valor = marcaEntity ? marcaEntity.option : null;
        //console.log(JSON.stringify(valor, null, 2));
        await db.AdditionalInfo.create({
            ticket_id: Ticket.id,
            key_name: xentity,
            value: valor
          });
      });
      /*
      response.entities.forEach((entity) => {
        console.log(entity)
      });
      */
      
      
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

app.get("/departamentos", async (req, res) => {
  let departamentos = await db.Department.findAll();
  
  res.json(departamentos);
});