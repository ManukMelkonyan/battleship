const Joi = require("joi");

const dataJson = JSON.parse('{ "type": "move", "body": "" }');
const schema = Joi.object().keys({
  type: Joi.string().valid("boardConfig", "move").required(),
  body: Joi.object().required(),
});

console.log(dataJson);
console.log(schema.validate(dataJson));
