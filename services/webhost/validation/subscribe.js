import Joi from "joi";

import { pairs } from "../../common/config/pairs.js";

const subscribeSchema = Joi.object({
  pairs: Joi.array()
    .items(Joi.string().valid(...pairs))
    .min(1)
    .required()
});

function validateSubscribe(order) {
  return subscribeSchema.validateAsync(order);
}

export { validateSubscribe };
