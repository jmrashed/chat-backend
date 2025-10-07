const Joi = require('joi');

/**
 * Validation schema for creating a chat room
 */
const createChatRoomValidation = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .trim()
    .messages({
      'string.base': 'Room name must be a string',
      'string.empty': 'Room name cannot be empty',
      'string.min': 'Room name must be at least 3 characters long',
      'string.max': 'Room name cannot exceed 50 characters',
      'any.required': 'Room name is required'
    }),
  description: Joi.string()
    .max(200)
    .optional()
    .trim()
    .messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description cannot exceed 200 characters'
    })
});

/**
 * Validation schema for room ID parameter
 */
const roomIdValidation = Joi.object({
  roomId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid room ID format',
      'any.required': 'Room ID is required'
    })
});

/**
 * Validation schema for pagination query parameters
 */
const paginationValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('name', 'createdAt', 'description').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createChatRoomValidation,
  roomIdValidation,
  paginationValidation
};