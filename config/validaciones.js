const validator = require('validator');


function validarTexto(texto) {
  return /^[a-zA-Z\s]+$/.test(texto);
}

function validarEmail(email) {
  return validator.isEmail(email);
}


module.exports = {
  validarTexto, 
  validarEmail
};