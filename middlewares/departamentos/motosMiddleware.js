const db = require('../../models');
const validacion = require('../../config/validaciones');
const { WSProc, moment, regex, delay, TsToDateString } = require('../../utils');

const {
  whatsappMessage,
  messageInteractive,
  messageAction,
  messageObject,
  templateComponent
} = require('../../lib');


const Middleware = (req, res, next) => {
  const datos = WSProc(req.body);
  const message = datos.messages[0];
  
  
  next();
};


module.exports = Middleware;