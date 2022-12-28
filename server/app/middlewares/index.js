const { validateMessage } = require('../helpers/validator');

const messageValidationMiddleware = (socket) => (message) => {
  if (!validateMessage(message)) {
    socket.close(1003);
  }
};

const boardConfigMiddleware = (socket) => (message) => {
  
};


module.exports = {
  messageValidationMiddleware,
};
