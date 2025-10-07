const Joi = require('joi');

/**
 * Validation schema for file upload
 */
const fileUploadValidation = Joi.object({
  originalname: Joi.string().required(),
  mimetype: Joi.string()
    .valid(
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    .required()
    .messages({
      'any.only': 'File type not allowed. Supported types: images, PDF, text, Word, Excel'
    }),
  size: Joi.number()
    .max(10 * 1024 * 1024) // 10MB
    .required()
    .messages({
      'number.max': 'File size cannot exceed 10MB'
    })
});

/**
 * Validation schema for file ID parameter
 */
const fileIdValidation = Joi.object({
  fileId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid file ID format',
      'any.required': 'File ID is required'
    })
});

/**
 * Validation schema for file query parameters
 */
const fileQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
  sort: Joi.string().valid('filename', 'createdAt', 'size').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  type: Joi.string().valid('image', 'document', 'text').optional()
});

/**
 * File type categories for filtering
 */
const fileTypeCategories = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  text: ['text/plain']
};

module.exports = {
  fileUploadValidation,
  fileIdValidation,
  fileQueryValidation,
  fileTypeCategories
};