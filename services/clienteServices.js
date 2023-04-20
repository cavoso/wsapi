const db = require('../models');

async function crearClienteSiNoExiste(waid, waprofile) {
  try {
    const [cliente, created] = await db.Cliente.findOrCreate({
      where: { waid },
      defaults: { waid, waprofile }
    });

    return cliente;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  crearClienteSiNoExiste
};