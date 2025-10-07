const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require("bcryptjs");

const { registerValidate, loginValidate } = require('../validations/auth');

const {
  sendSuccessResponse,
  sendCreatedResponse,
  sendClientErrorResponse,
  sendNotFoundResponse,
  sendInternalServerErrorResponse,
  sendUnauthorizedResponse,
} = require("../utils/responseFormatter"); // Corrected import path
const logger = require('../utils/logger');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.body.username - User's username
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @returns {Object} Response with user ID or error
 */
exports.register = async (req, res) => {
 const {username, email, password} = req.body
  const { error } = registerValidate.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(err => err.message);
    return sendClientErrorResponse(res, "Validation failed", errorMessages);
  }
   // Check if the user already exists
   const existingUser = await User.findOne({ email });
   if (existingUser) {
     return sendClientErrorResponse(res, "Email already registered.", ["Email already registered."]);
   }
   const newUser = new User({ username, email, password });
   await newUser.save();

   return sendCreatedResponse(res, "User registered successfully.", { userId: newUser._id });
};

/**
 * Authenticate user login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @returns {Object} Response with JWT token and user data or error
 */
exports.login = async (req, res) => {
  const { error } = loginValidate.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(err => err.message);
    return sendClientErrorResponse(res, "Validation failed", errorMessages);
  }
  
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return sendUnauthorizedResponse(res, "Invalid credentials");

    if (!(await user.comparePassword(password))) {
      return sendUnauthorizedResponse(res, "Invalid credentials");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const data = {
      id       : user._id,
      username : user.username,
      email    : user.email,
      accessToken: token,
      createdAt : user.createdAt
    }
    return sendSuccessResponse(res, "Login successful", data);
  } catch (error) {
    logger.error("Error logging in:", error);
    return sendInternalServerErrorResponse(res, "An error occurred during login");
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
