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
  
  //console.log(JSON.stringify(req.body, null, 2));
  
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
  //console.log(wa_id)
  let ticket = null
  let tickets = await db.getRecords('Ticket', `waid = ${wa_id} and status != 'FINALIZADO'`).then((result) => result);
  
  if(tickets.length == 0){
    let create_ticket = await db.createRecord('Ticket', {waid: wa_id}).then((result) => result);
    let xtickets = await db.getRecords('Ticket', `id = ${create_ticket.insertId}`).then((result) => result);
    ticket = JSON.parse(JSON.stringify(xtickets[0]));
  }else{
    ticket = JSON.parse(JSON.stringify(tickets[0]));
  }
  let clientes = await db.getRecords('Cliente', `waid = ${wa_id}`).then((result) => result);
  if(clientes.length == 0){
    let create_cliente = await db.createRecord('Cliente', {waid: wa_id, waprofile: name_profile}).then((result) => result);
  }
  console.log(ticket);
  let msg = {};
  if ('messages' in req.body.entry[0].changes[0].value) {
    // Si la propiedad "contacts" existe dentro de "value"
    //console.log(req.body.entry[0].changes[0].value.messages[0])
    let date = new Date(parseInt(req.body.entry[0].changes[0].value.messages[0].timestamp) * 1000);
    let mysqlDatetimeString = date.toISOString().slice(0, 19).replace('T', ' ');
    await db.createRecord('Ticket_Mensajes', {ticket: ticket.id, waid: wa_id, wamid: req.body.entry[0].changes[0].value.messages[0].id, timestamp: mysqlDatetimeString,  type: req.body.entry[0].changes[0].value.messages[0].type, message: JSON.stringify(req.body.entry[0].changes[0].value.messages[0][req.body.entry[0].changes[0].value.messages[0].type]) }).then((result) => result);
    await db.updateTicket('Ticket', ticket.id);
    if(msg.type == "interactive"){
      if('context' in msg){
        //console.log(msg.context.id)
        let mensaje_env = await db.getRecords('Ticket_Mensajes', `wamid = '${msg.context.id}'`).then((result) => result);
        let msgo = mensaje_env[0];
        let msgo_m = JSON.parse(msgo.message);        
        if(msgo_m.action.button == "Sel. departamento"){
           let update_ticket = await db.updateRecord('Ticket', ticket.id, {departamento: msg.interactive.list_reply.title}).then((result) => result);
          ticket.departamento = msg.interactive.list_reply.title;
        }
        if(msgo_m.action.button == "Sel. Sucursal"){
           let update_ticket = await db.updateRecord('Ticket', ticket.id, {sucursal: msg.interactive.list_reply.id}).then((result) => result);
            ticket.sucursal = msg.interactive.list_reply.id;
        }
      }
    }
  }
  let phone_number = req.body.entry[0].changes[0].value.metadata.display_phone_number;
  let phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
  
  if(ticket.status == 'PENDIENTE' && !req.body.entry[0].changes[0].value.statuses){
    if(ticket.departamento == null)
    {
      let getdepartamentos = await db.getAllRecords('Departamento').then((result) => result);
      let departamentos = [];
      for (const dep of getdepartamentos) {
        departamentos.push({
          "id": dep.id,
          "title": dep.nombre
        });
      }
      let msg_dep = {
          messaging_product: "whatsapp",
          to: wa_id,
          type: "interactive",
          "interactive": {
            "type": "list",
            "header": {
              "type": "text",
              "text": "Bienvenido a RS-Shop"
            },
            "body": {
              "text": "Por favor seleccione el departamento con el cual desea contactar"
            },
            "footer": {
              "text": "Bot RS"
            },
            "action": {
              "button": "Sel. departamento",
              "sections": [
                {
                  "title": "Departamentos",
                  "rows": departamentos
                }
              ]
            }
          }
        };
      axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v16.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: msg_dep,
        headers: { "Content-Type": "application/json" },
      }).then(async (result) => {
        let data = result.data;
        let date = new Date();
        let mysqlDatetimeString = date.toISOString().slice(0, 19).replace('T', ' ');
        let add_message = await db.createRecord('Ticket_Mensajes', {ticket: ticket.id, waid: phone_number, wamid: data.messages[0].id, timestamp: mysqlDatetimeString,  type: msg_dep.type, message: JSON.stringify(msg_dep[msg_dep.type]) }).then((result) => result);
      }).catch((error) => {
        //console.log(error);
      });

      return res.sendStatus(200);
    }
    if(ticket.sucursal == null)
    {
      let sucursales = [{
        "id": 16,
        "title": "Chillan Viejo (Casas Matriz)"
      },{
        "id": 2,
        "title": "Temuco"
      },{
        "id": 3,
        "title": "Vitacura"
      },{
        "id": 4,
        "title": "La Serena"
      },{
        "id": 5,
        "title": "Raul Labbe"
      },{
        "id": 6,
        "title": "Apoquindo"
      }];
      let msg_dep = {
          messaging_product: "whatsapp",
          to: wa_id,
          type: "interactive",
          "interactive": {
            "type": "list", 
            "header": {
              "type": "text",
              "text": "RS-Shop"
            },
            "body": {
              "text": "Por favor seleccione la sucursal más cercana a su ubicación"
            },
            "footer": {
              "text": "Bot RS"
            },
            "action": {
              "button": "Sel. Sucursal",
              "sections": [
                {
                  "title": "Sucursales",
                  "rows": sucursales
                }
              ]
            }
          }
        };
      axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v16.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: msg_dep,
        headers: { "Content-Type": "application/json" },
      }).then(async (result) => {
        let data = result.data;
        let date = new Date();
        let mysqlDatetimeString = date.toISOString().slice(0, 19).replace('T', ' ');
        let add_message = await db.createRecord('Ticket_Mensajes', {ticket: ticket.id, waid: phone_number, wamid: data.messages[0].id, timestamp: mysqlDatetimeString,  type: msg_dep.type, message: JSON.stringify(msg_dep[msg_dep.type]) }).then((result) => result);
      }).catch((error) => {
        //console.log(error);
      });

      return res.sendStatus(200);
    }
    if(ticket.departamento != null && ticket.sucursal != null){
       let update_ticket = await db.updateRecord('Ticket', ticket.id, {status: 'ACTIVO', inbot: 0}).then((result) => result);
       ticket.status = 'ACTIVO';
       ticket.inbot = 0;
    }
  }
  if(ticket.status == 'ACTIVO' && !req.body.entry[0].changes[0].value.statuses){
    if(ticket.vendedor == null)
    {
      let msg_dep = {
          messaging_product: "whatsapp",
          to: wa_id,
          "type": "text",
          "text": {
            "preview_url": false,
            "body": "Uno de nuestros ejecutivos se contactará con usted muy pronto"
          }
        };
      axios({
        method: "POST", // Required, HTTP method, a string, e.g. POST, GET
        url:
          "https://graph.facebook.com/v16.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: msg_dep,
        headers: { "Content-Type": "application/json" },
      }).then(async (result) => {
        let data = result.data;
        let date = new Date();
        let mysqlDatetimeString = date.toISOString().slice(0, 19).replace('T', ' ');
        let add_message = await db.createRecord('Ticket_Mensajes', {ticket: ticket.id, waid: phone_number, wamid: data.messages[0].id, timestamp: mysqlDatetimeString,  type: msg_dep.type, message: JSON.stringify(msg_dep[msg_dep.type]) }).then((result) => result);
      }).catch((error) => {
        //console.log(error);
      });
      return res.sendStatus(200);
    }
  }
  
  
  
  
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
