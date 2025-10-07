/**
 * Environment-specific configuration
 */

const development = {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3020', 'http://127.0.0.1:3000'],
    credentials: true
  },
  logging: {
    level: 'debug',
    format: 'dev'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // Very high limit for development
  },
  database: {
    debug: true
  }
};

const production = {
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : false,
    credentials: true
  },
  logging: {
    level: 'info',
    format: 'combined'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Strict limit for production
  },
  database: {
    debug: false
  }
};

const test = {
  cors: {
    origin: true,
    credentials: true
  },
  logging: {
    level: 'error',
    format: 'dev'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 10000 // High limit for testing
  },
  database: {
    debug: false
  }
};

const configs = {
  development,
  production,
  test
};

const environment = process.env.NODE_ENV || 'development';

/**
 * Get configuration for current environment
 * @returns {Object} Environment-specific configuration
 */
const getConfig = () => {
  return configs[environment] || configs.development;
};

/**
 * Check if running in production
 * @returns {boolean} True if production environment
 */
const isProduction = () => {
  return environment === 'production';
};

/**
 * Check if running in development
 * @returns {boolean} True if development environment
 */
const isDevelopment = () => {
  return environment === 'development';
};

/**
 * Check if running in test
 * @returns {boolean} True if test environment
 */
const isTest = () => {
  return environment === 'test';
};

module.exports = {
  getConfig,
  isProduction,
  isDevelopment,
  isTest,
  environment
};