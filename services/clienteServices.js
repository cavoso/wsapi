const db = require('../models');

async function crearClienteSiNoExiste(waid, waprofile) {
  try {
    const [cliente, created] = await db.Client.findOrCreate({
      where: { wa_id: waid },
      defaults: { wa_id: waid, profile_name: waprofile }
    });

    return cliente;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  crearClienteSiNoExiste
};