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

const {
  whatsappMessage,
  messageInteractive,
  messageAction,
  messageObject,
  templateComponent
} = require('./lib');


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
    let mensaje = await db.Message.findOne({ where: { wamid: datos.statuses[0].id } });
    if(mensaje){
      mensaje.update({status: datos.statuses[0].status});
    }
    
  }else{
    //aqui se procesan los mensajes
    let waid = null;
    let Departamento = null;
    let Cliente = null;
    let Ticket = null;
    let TicketData = null;
    let context = null
    
    if("metadata" in datos){
      //revisamos el departamento en base al numero de telefono al cual se le envio el mensaje
      Departamento = await db.Department.findOne({ where: { phone_number: datos.metadata.display_phone_number, phone_number_id: datos.metadata.phone_number_id } });
    }
    if ("contacts" in datos){
      //aqui se revisa y crea el cliente y el ticket, en caso de que el ticket se cree, se envia un mensaje notificando al cliente de que se a creado un ticket
      waid = datos.contacts[0].wa_id;
      Cliente = await ClienteService.crearClienteSiNoExiste(waid, datos.contacts[0].profile.name);
      const TicketCheck = await TicketService.buscarOCrearTicket(waid, Departamento.id);
      context = conversations.get(waid);
      if (!context){
        context = {};
        conversations.set(waid, context);
      }
      Ticket = TicketCheck[0];
      TicketData = await db.AdditionalInfo.findAll({
        where: {
          ticket_id: Ticket.id
        }
      });
      
      if(TicketCheck[1]){
        context = {};
        conversations.set(waid, context);
        let msg = new whatsappMessage(Ticket.wa_id).createTextMessage(`Ticket creado exitosamente. ID asignado: ${String(Ticket.id).padStart(7, '0')}.`);      
        MessageService.EnviarMensaje(Departamento, Ticket, msg)
      }
    }
    
    if (!context.pendingContactData) {
      // Inicializar el objeto pendingData con los datos personales pendientes
      context.pendingContactData = {
        full_name: !Cliente.full_name,
        email: !Cliente.email,
      };
    }
    
    if ("messages" in datos){
      const message = datos.messages[0];
      //console.log(JSON.stringify(message, null, 2));
      //agregamos el mensaje entrante 
      await TicketService.agregarMensaje(Ticket, {
        ticket_id: Ticket.id,
        wamid: message.id,
        content: JSON.stringify(message),
        direction: "INCOMING",
        created_at: TsToDateString(message.timestamp)
      });
       
      let text = "";
      let type = message.type;
      if (type === "text") {
        text = message.text.body;
      }else if(type === "interactive"){
        if(message.interactive.type === "list_reply"){
          text = message.interactive.list_reply.title;
        }else if(message.interactive.type === "button_reply"){
          text = message.interactive.button_reply.id;
        }
      }
      
      let response = await nlp.process('es', text, context);
      
      if(response.intent === "reserva"){
        
      }else if(response.intent === "verificacion"){
        if(response.utterance === "SI"){
          if(context.checkclientdata){
            context.checkclientdata = false;
            context.SolicitarContactData = true;
          }          
        }
        else if(response.utterance === "NO"){
          if(context.checkclientdata){
            context.checkclientdata = false;
            context.SolicitarContactData = false;
            Cliente.update({nofilldatabot: 1});
          }
          
        }
      }else if (response.intent === 'omitir') {
        if(context.SolicitarContactData){
          for (const key in context.pendingContactData) {
            if (context.pendingContactData[key]) {
              context.pendingContactData[key] = false;
              break;
            }
          }
          Cliente.update({ nofilldatabot: 1 });
        }
        
      }else if(response.intent === 'ciudad'){
        let esValido = validacion.validarTexto(response.utterance);
        if(esValido){
          Ticket.update({city : response.utterance});
        }
      }else{
        if(context.SolicitarContactData){
          if (validacion.hayCampoPendiente(context.pendingContactData)) {
            let esValido = false;
            for (const key in context.pendingContactData) {
              if (context.pendingContactData[key]) {
                switch (key) {
                  case 'full_name':
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
                  MessageService.EnviarMensaje(Departamento, Ticket, new whatsappMessage(Ticket.wa_id).createTextMessage("Lo siento, pero al parecer la información ingresada contiene caracteres no validos"));
                }
                if (!validacion.hayCampoPendiente(context.pendingContactData)){
                  context.SolicitarContactData = false;
                  MessageService.EnviarMensaje(Departamento, Ticket, new whatsappMessage(Ticket.wa_id).createTextMessage(`Muchas gracias ${Cliente.getDisplayName()} por proporcionarnos tu informacion.`));
                }
                break;
              }
            }
          }else{
            context.SolicitarContactData = false;
          }
        }else{
          if(Ticket.agent_id === 0 && Ticket.status === 'OPEN'){
            MessageService.EnviarMensaje(Departamento, Ticket, new whatsappMessage(Ticket.wa_id).createTextMessage("Lo siento, no puedo entender este tipo de mensaje."));
          }
          
        }
      }
      
      //console.log(context)
      if (validacion.hayCampoPendiente(context.pendingContactData)){
        if(Cliente.nofilldatabot == 0){
          if(context.SolicitarContactData === undefined){
            context.checkclientdata = true;
            MessageService.EnviarMensaje(Departamento, Ticket, new whatsappMessage(Ticket.wa_id).createTextMessage(`nos gustaría asegurarnos de tener la información de contacto correcta y actualizada en nuestro sistema para ofrecerle la mejor experiencia y servicio`));
            await delay(2000);
            let msg = new whatsappMessage(Ticket.wa_id).createInteractiveMessage(
              new messageInteractive("button").addBody("¿Actualizar datos?").addAction(
                new messageAction("button").addButton("SI", "SI").addButton("No", "No").toJSON()
              ).toJSON()
            );
            MessageService.EnviarMensaje(Departamento, Ticket, msg);
          }else{
            if(context.SolicitarContactData){
              for (const key in context.pendingContactData) {
                if (context.pendingContactData[key]) {
                  let pregunta;
                  switch (key) {
                    case 'full_name':
                      pregunta = 'Ingresa su nombre completo, o escribe "omitir" para saltar.';
                      break;
                    case 'email':
                      pregunta = 'Ingresa tu dirección de correo electrónico o escribe "omitir" para saltar.';
                      break;
                  }
                  MessageService.EnviarMensaje(Departamento, Ticket, new whatsappMessage(Ticket.wa_id).createTextMessage(pregunta));
                  break;
                }
              }
            }
          }
          
        }
      }else{
        console.log(Ticket.city)
        if(Ticket.city === ""){
          let agentes = await db.Agent.findAll({
            where: {
              department_id: Departamento.id
            }
          });
          //MessageService.EnviarMensaje(Departamento, Ticket, new whatsappMessage(Ticket.wa_id).createTextMessage("Lo siento, no puedo entender este tipo de mensaje."));
          let lista = new messageObject("Ciudades", "list");
          for (const agente of agentes){
            lista.addRow(agente.city, agente.city);
          }
          let msg = new whatsappMessage(Ticket.wa_id).createInteractiveMessage(
            new messageInteractive("list").addBody("Por favor seleccione la ciudad mas cercana a usted").addAction(
              new messageAction("list").addButton("Ciudades").addSection(lista.toJSON()).toJSON()
            ).toJSON()
          );
          MessageService.EnviarMensaje(Departamento, Ticket, msg);
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

app.get("/departamentos", async (req, res) => {
  let departamentos = await db.Department.findAll();
  
  res.json(departamentos);
});