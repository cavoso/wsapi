const statusesMiddleware = (req, res, next) => {
  // Asumimos que la información del estado se encuentra en req.body.status
  const status = req.body.status;

  switch (status) {
    case 'received':
      // Aquí puedes manejar la lógica cuando el mensaje es recibido por el servidor
      console.log('Mensaje recibido');
      break;
    case 'delivered':
      // Aquí puedes manejar la lógica cuando el mensaje es entregado al destinatario
      console.log('Mensaje entregado');
      break;
    case 'read':
      // Aquí puedes manejar la lógica cuando el mensaje es leído por el destinatario
      console.log('Mensaje leído');
      break;
    default:
      // Aquí puedes manejar cualquier otro estado o caso que no esté especificado
      console.log('Estado desconocido');
  }

  // Pasa al siguiente middleware
  next();
};

module.exports = statusesMiddleware;
