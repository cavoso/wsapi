const validator = require('validator');

function validarTexto(texto) {
  return /^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/.test(texto);
}

function validarEmail(email) {
  return validator.isEmail(email);
}



function hayCampoPendiente(pendingData) {
  return Object.values(pendingData).some(value => value === true);
}


module.exports = {
  validarTexto, 
  validarEmail,
  hayCampoPendiente
};