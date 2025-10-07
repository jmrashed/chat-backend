const Joi = require('joi');

// Enhanced message validation with new features
const sendMessageValidation = Joi.object({
  roomId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  content: Joi.string().min(1).max(1000).required().trim(),
  fileId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  replyTo: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  mentions: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional()
});

// Reaction validation
const reactionValidation = Joi.object({
  emoji: Joi.string().required().messages({
    'any.required': 'Emoji is required'
  })
});

// Edit message validation
const editMessageValidation = Joi.object({
  content: Joi.string().min(1).max(1000).required().trim()
});

// Search validation
const searchValidation = Joi.object({
  query: Joi.string().min(1).required(),
  room: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// Favorite validation
const favoriteValidation = Joi.object({
  messageId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
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
  messageQueryValidation,
  reactionValidation,
  editMessageValidation,
  searchValidation,
  favoriteValidation
};