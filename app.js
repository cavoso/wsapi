"use strict";

// Imports dependencies and set up http server
const request = require("request");
const express = require("express");
const body_parser = require("body-parser");
const cors = require('cors');
const app = express().use(body_parser.json()).use(cors());

const nlp = require('./nlp/');

const {statusesMiddleware} = require('./middlewares');

(async () => {
  await nlp.load('model.nlp');
  console.log('Modelo NLP cargado');
})();

const conversations = new Map();

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
/*
app.post("/webhook", async (req, res) => {
  
  
  res.sendStatus(200);  
});
*/
app.post('/webhook', statusesMiddleware, (req, res, next) => {
  // Después de ejecutar el middleware de estados, determinamos el departamento y ejecutamos el middleware correspondiente
  const departmentMiddleware = determineDepartment(req);
  departmentMiddleware(req, res, next);
}, (req, res) => {
  // Aquí va la lógica de tu endpoint webhook
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