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
const validacion = require('./config/validaciones');


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const conversations = new Map();

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  let body = req.body;
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
    if (!context.pendingContactData) {
      // Inicializar el objeto pendingData con los datos personales pendientes
      context.pendingContactData = {
        nombres: !Cliente.nombres,
        paterno: !Cliente.paterno,
        materno: !Cliente.materno,
        email: !Cliente.email,
        ciudad: !Cliente.ciudad,
      };

    }
    
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
      console.log(message)
      let text = "";
      if (message.type === "text") {
        text = message.text.body;
      }else if(message.type === "interactive"){
        if(message.interactive.type === "list_reply"){
          text = message.interactive.list_reply.title;
        }else if(message.interactive.type === "button_reply"){
          text = message.interactive.button_reply.title;
        }
      }else if(message.type === "location"){
        text = "";
      }
      
      let response = await nlp.process('es', text, context);
      console.log(text)
      console.log(response)
      
      if(response.intent == "Saludo"){
        let nombre = Cliente.nombreOwaProfile();
        await MensajeService.MSGText(Ticket, response.answer.replace('{nombre}', Cliente.nombreOwaProfile()));
        await delay(2000);
        await MensajeService.MSGText(Ticket, "Soy {nombrebot}, tu ejecutivo virtual".replace('{nombrebot}', 'nombre_del_bot'));
        console.log(context.pendingContactData)
        if (validacion.hayCampoPendiente(context.pendingContactData)){
          if(Cliente.nofilldatabot == 0){
            await delay(2000);
            await MensajeService.MSGText(Ticket, "nos gustaría asegurarnos de tener la información de contacto correcta y actualizada en nuestro sistema para ofrecerle la mejor experiencia y servicio");
            await delay(2000);
            await MensajeService.MSGBotones(Ticket, `¿Actualizar datos?`, [
              MensajeService.GetButtonReplyFormat("aceptarInformacion", "Entregaré info"),
              MensajeService.GetButtonReplyFormat("rechazarInformacion", "No daré info"),
            ]);
          }
        }
      }else if(response.intent == "InfoUser.Acepto"){
        context.SolicitarContactData = true;
      }else if(response.intent == "InfoUser.NoAcepto"){
        context.SolicitarContactData = false;
      }else if (response.intent == 'omitir') {
        if(context.SolicitarContactData){
          for (const key in context.pendingContactData) {
            if (context.pendingContactData[key]) {
              context.pendingContactData[key] = false;
              break;
            }
          }
          Cliente.update({ nofilldatabot: 1 });
        }
        
      }else{
        if(context.SolicitarContactData){
          if (validacion.hayCampoPendiente(context.pendingContactData)) {
            let esValido = false;
            for (const key in context.pendingContactData) {
              if (context.pendingContactData[key]) {
                switch (key) {
                  case 'nombres':
                    esValido = validacion.validarTexto(response.utterance);
                  case 'paterno':
                    esValido = validacion.validarTexto(response.utterance);
                  case 'materno':
                    esValido = validacion.validarTexto(response.utterance);
                  case 'ciudad':
                    esValido = validacion.validarTexto(response.utterance);
                    break;
                  case 'email':
                    esValido = validacion.validarEmail(response.utterance);
                    break;
                }
                if (esValido) {
                  Cliente.update({ [key]: response.utterance });
                  context.pendingContactData[key] = false;
                  
                } else {
                  await MensajeService.MSGText(Ticket, "Lo siento, pero al parecer la información ingresada contiene caracteres no validos");
                }
                break;
              }
            }
          }else{
            context.SolicitarContactData = false;
          }
        }else{
          await MensajeService.MSGText(Ticket, "Lo siento, no puedo entender este tipo de mensaje.");
        }
      }
      
      //verificamos si se cargaran los datos de usuario
      if(context.SolicitarContactData){
        for (const key in context.pendingContactData) {
            if (context.pendingContactData[key]) {
              let pregunta;
              switch (key) {
                case 'nombres':
                  pregunta = 'Ingresa solo tu(s) nombre(s), sin apellidos, o escribe "omitir" para saltar.';
                  break;
                case 'paterno':
                  pregunta = 'Ingresa tu apellido paterno, sin incluir nombres, o escribe "omitir" para saltar.';
                  break;
                case 'materno':
                  pregunta = 'Ingresa tu apellido materno, sin incluir nombres, o escribe "omitir" para saltar.';
                  break;
                case 'email':
                  pregunta = 'Ingresa tu dirección de correo electrónico o escribe "omitir" para saltar.';
                  break;
                case 'ciudad':
                  pregunta = 'Ingresa el nombre de tu ciudad, envía tu ubicación o escribe "omitir" para saltar.';
                  break;
              }
              await MensajeService.MSGText(Ticket, pregunta);
              break;
            }
          }
      }else{
        
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
