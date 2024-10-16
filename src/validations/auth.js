const Joi = require("joi");
// Define a validation schema using Joi
const registerValidate = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      "string.base": `"Username" should be a type of 'text'`,
      "string.empty": `"Username" cannot be an empty field`,
      "string.min": `"Username" should have a minimum length of {#limit}`,
      "string.max": `"Username" should have a maximum length of {#limit}`,
      "any.required": `"Username" is a required field`,
    }),
    email: Joi.string().email().required().messages({
      "string.base": `"Email" should be a type of 'text'`,
      "string.empty": `"Email" cannot be an empty field`,
      "string.email": `"Email" must be a valid email`,
      "any.required": `"Email" is a required field`,
    }),
    password: Joi.string().min(6).required().messages({
      "string.base": `"Password" should be a type of 'text'`,
      "string.empty": `"Password" cannot be an empty field`,
      "string.min": `"Password" should have a minimum length of {#limit}`,
      "any.required": `"Password" is a required field`,
    }),
  });
  
  // Define a validation schema for login using Joi
  const loginValidate = Joi.object({
    email: Joi.string().email().required().messages({
      "string.base": `"Email" should be a type of 'text'`,
      "string.empty": `"Email" cannot be an empty field`,
      "string.email": `"Email" must be a valid email`,
      "any.required": `"Email" is a required field`,
    }),
    password: Joi.string().min(6).required().messages({
      "string.base": `"Password" should be a type of 'text'`,
      "string.empty": `"Password" cannot be an empty field`,
      "string.min": `"Password" should have a minimum length of {#limit}`,
      "any.required": `"Password" is a required field`,
    }),
  });


  module.exports = {
    registerValidate,
    loginValidate
  }