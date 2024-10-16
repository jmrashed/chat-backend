const User = require("../models/User"); // Assuming you have a User model
const jwt = require("jsonwebtoken");

const {
  sendSuccessResponse,
  sendCreatedResponse,
  sendClientErrorResponse,
  sendNotFoundResponse,
  sendInternalServerErrorResponse,
  sendUnauthorizedResponse,
} = require("../utils/responseFormatter"); // Corrected import path
const { register,login } = require("../services/authService");

// Register a new user
const registerUser = async (req, res) => {
  return await register(req, res);
};

// Log in a user
const loginUser = async (req, res) => {
  return await login(req, res);
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return sendNotFoundResponse(res, "User not found");

    return sendSuccessResponse(res, "User retrieved successfully", user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    return sendInternalServerErrorResponse(res, "Error retrieving user");
  }
};

// Log out a user
const logoutUser = (req, res) => {
  return sendSuccessResponse(res, "User logged out successfully.");
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
};
