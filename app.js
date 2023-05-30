"use strict";

// Imports dependencies and set up http server
//const request = require("request");
const express = require("express");
const body_parser = require("body-parser");
const cors = require('cors');
const app = express().use(body_parser.json()).use(cors());

const db = require('./models');
const nlp = require('./nlp/');
const {Sequelize, Op } = require('sequelize');

const { WSProc, moment, regex, delay, TsToDateString } = require('./utils');
const { statusEvents, metadataEvents, contactsEvents,  messageEvents } = require('./events');

//const {messageStatusMiddleware, departmentMiddleware, clientTicketMiddleware, messageMiddleware} = require('./middlewares');

const conversations = new Map();
const listTicket = [];

async function checkTickets() {
  for (const ticketId of listTicket) {
    const ticket = await db.Ticket.findOne({
      where: {
        id: ticketId,
        [Op.and]: Sequelize.literal('TIMESTAMPDIFF(MINUTE, updated_at, NOW()) >= 15'),
      },
    });

    if (ticket) {
      if(ticket.agent_id == 0){
        await db.Ticket.update({
          available_to_all: true
        }, {
          where: {
            id: ticket.id
          }
        });
      }
      /*
      eventData.Ticket.update({
            status : 'IN_PROGRESS',
            updated_at: db.sequelize.literal('NOW()')
          });
          */
    }
  }
}

setInterval(checkTickets, 60000);

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));


app.post('/webhook', async (req, res) => {
  
  const {statuses, metadata, contacts, messages} = WSProc(req.body);
  //console.log(JSON.stringify(statuses, null, 2));
  //console.log(JSON.stringify(contacts, null, 2));
  
  if(statuses !== undefined){
    await statusEvents(statuses[0]);
  }else{
    let eventData = {
      KeyContext: null,
      Departamento: null,
      Cliente: null,
      Ticket: null,
      TicketData: null,
      context: null,
    };
    if(metadata){
      await metadataEvents(eventData, metadata);
    }
    if(contacts){
      await contactsEvents(eventData, conversations, contacts[0]);
    }
    if(messages){
      await messageEvents(eventData, conversations, messages[0], nlp, listTicket);
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

app.get("/marcas", async (req, res) => {
   let marcas = await db.MenuVehiculos.findAll({
    where: {
      padre: 0
    }
  });
  
  res.json(marcas);
})