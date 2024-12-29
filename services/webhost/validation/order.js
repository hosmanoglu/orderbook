import Joi from "joi";

import { pairs } from "../../common/config/pairs.js";

const orderSchema = Joi.object({
  pair: Joi.string()
    .valid(...pairs)
    .required(),
  price: Joi.number().positive().required(),
  type: Joi.string().valid("buy", "sell").required(),
  quantity: Joi.number().positive().required(),
});

function validateOrder(order) {
  return orderSchema.validateAsync(order);
}

export { validateOrder };
