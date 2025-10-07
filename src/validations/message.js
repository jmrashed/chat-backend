const Joi = require('joi');

/**
 * Validation schema for sending a message
 */
const sendMessageValidation = Joi.object({
  roomId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid room ID format',
      'any.required': 'Room ID is required'
    }),
  content: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .trim()
    .messages({
      'string.base': 'Message content must be a string',
      'string.empty': 'Message content cannot be empty',
      'string.min': 'Message content must be at least 1 character long',
      'string.max': 'Message content cannot exceed 1000 characters',
      'any.required': 'Message content is required'
    }),
  fileId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid file ID format'
    })
});

/**
 * Validation schema for message ID parameter
 */
const messageIdValidation = Joi.object({
  messageId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid message ID format',
      'any.required': 'Message ID is required'
    })
});

/**
 * Validation schema for getting messages with pagination
 */
const getMessagesValidation = Joi.object({
  roomId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid room ID format',
      'any.required': 'Room ID is required'
    })
});

/**
 * Validation schema for message query parameters
 */
const messageQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  sort: Joi.string().valid('timestamp', 'createdAt').default('timestamp'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
  before: Joi.date().iso().optional(),
  after: Joi.date().iso().optional()
});

module.exports = {
  sendMessageValidation,
  messageIdValidation,
  getMessagesValidation,
  messageQueryValidation
};