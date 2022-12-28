const Joi = require("joi");

const validateMessage = (message) => {
  if (typeof message !== "string") return false;
  try {
    const dataJson = JSON.stringify(message);
    const schema = Joi.object().keys({
      type: Joi.string().valid("boardConfig", "move").required(),
      body: Joi.object().required(),
    });
    const { error } = schema.validate(dataJson);
    return !error;
  } catch {
    return false;
  }
};


const validateBoard = (boardConfig = {}) => {
  const shipIds = Array.from(Object.keys());
};

const isBoardConfig = (data) => {
  try {
    const dataObj = JSON.stringify(data);
    if ("boardConfig" in dataObj) {
      return true;
    }
    return;
    return false;
  } catch (e) {
    return false;
  }
};


module.exports = {
  validateMessage,
};
