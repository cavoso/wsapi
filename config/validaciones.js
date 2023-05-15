const validator = require('validator');


function validarTexto(texto) {
  return /^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/.test(texto);
}

function validarEmail(email) {
  return validator.isEmail(email);
}

function variablesMenu(texto) {
  const patron = /([^_]+)_menu_([^_]+)_([^_]+)/;
  const coincidencias = texto.match(patron);

  if (coincidencias) {
    const iddep = coincidencias[1];
    const tipo = coincidencias[2];
    const id = coincidencias[3];

    return { iddep, tipo, id };
  } else {
    return null;
  }
}



function hayCampoPendiente(pendingData) {
  return Object.values(pendingData).some(value => value === true);
}


module.exports = {
  validarTexto, 
  validarEmail,
  hayCampoPendiente
};