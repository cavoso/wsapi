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

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  db = require("./Database"),
  axios = require("axios").default,
  app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
  console.log(JSON.stringify(req.body, null, 2));
  let wa_id = 0;
  let name_profile = "";
  if ('contacts' in req.body.entry[0].changes[0].value) {
    // Si la propiedad "contacts" existe dentro de "value"
    wa_id = req.body.entry[0].changes[0].value.contacts[0].wa_id
    name_profile = req.body.entry[0].changes[0].value.contacts[0].profile.name
  } else {
    // Si la propiedad "contacts" no existe dentro de "value"
    wa_id = req.body.entry[0].changes[0].value.statuses[0].recipient_id
  }
  console.log(wa_id)
  let ticket = null
  let tickets = await db.getRecords('Ticket', `waid = ${wa_id} and status != 'FINALIZADO'`).then((result) => result);
  
  if(tickets.length == 0){
    let create_ticket = await db.createRecord('Ticket', {waid: wa_id}).then((result) => result);
    let xtickets = await db.getRecords('Ticket', `id = ${create_ticket.insertId}`).then((result) => result);
    ticket = JSON.parse(JSON.stringify(xtickets[0]));
  }else{
    ticket = JSON.parse(JSON.stringify(tickets[0]));
  }
  console.log(ticket);
  /*
  db.getRecords('Ticket', `waid = ${wa_id} and status != 'FINALIZADO'`, (error, result) => {
    if(result.length == 0){
      db.createRecord('Ticket', {waid: wa_id}, (cerror, cresult) => {
        db.getRecords('Ticket', `id = ${cresult.insertId}`, (xerror, xresult) => {
          ticket = xresult.RowDataPacket;
        })
      });
    }else{
      ticket = result.RowDataPacket;
    }
  });
  console.log(ticket)
  */
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
