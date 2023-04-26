const statusesMiddleware = (req, res, next) => {
  
   const datos = WSProc(body);

  // Pasa al siguiente middleware
  next();
};

module.exports = statusesMiddleware;
