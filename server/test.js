
const Joi = require("joi");
const { validateBoardConfig } = require("./app/helpers/validator");

// const dataJson = JSON.parse('{ "type": "move", "body": "" }');
// const schema = Joi.object().keys({
//   type: Joi.string().valid("boardConfig", "move").required(),
//   body: Joi.object().required(),
// });

// console.log(dataJson);
// console.log(schema.validate(dataJson));
const body = {
  "0:0": {
      "size": 4,
      "orientation": "HORIZONTAL"
  },
  "0:9": {
      "size": 1,
      "orientation": "HORIZONTAL"
  },
  "2:2": {
      "size": 2,
      "orientation": "HORIZONTAL"
  },
  "4:2": {
      "size": 2,
      "orientation": "HORIZONTAL"
  },
  "2:5": {
      "size": 1,
      "orientation": "HORIZONTAL"
  },
  "2:7": {
      "size": 1,
      "orientation": "HORIZONTAL"
  },
  "4:5": {
      "size": 2,
      "orientation": "HORIZONTAL"
  },
  "2:9": {
      "size": 1,
      "orientation": "HORIZONTAL"
  },
  "2:0": {
      "size": 3,
      "orientation": "VERTICAL"
  },
  "0:5": {
      "size": 3,
      "orientation": "HORIZONTAL"
  }
};


validateBoardConfig(body)