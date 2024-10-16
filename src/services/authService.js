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
const { register } = require("../services/authService");
const logger = require('../utils/logger');

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
    logger.error("Error logging in:", error); // Use logger for error logging
    return sendInternalServerErrorResponse(res, "An error occurred during login");
  }
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
