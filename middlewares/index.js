const messageStatusMiddleware = require('./messageStatusMiddleware');
const departmentMiddleware = require('./departmentMiddleware');
const clientTicketMiddleware = require('./clientTicketMiddleware');
const messageMiddleware = require('./messageMiddleware');

module.exports = {
  messageStatusMiddleware,
  departmentMiddleware,
  clientTicketMiddleware,
  messageMiddleware
};