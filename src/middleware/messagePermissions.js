const ChatMessage = require("../models/Message");
const { sendClientErrorResponse, sendNotFoundResponse } = require("../utils/responseFormatter");

// Check if user can edit/delete message
const checkMessageOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await ChatMessage.findById(id);
    if (!message) {
      return sendNotFoundResponse(res, "Message not found.");
    }

    if (message.sender.toString() !== userId && !req.user.isAdmin) {
      return sendClientErrorResponse(res, "Unauthorized to perform this action.");
    }

    req.message = message;
    next();
  } catch (error) {
    return sendClientErrorResponse(res, "Error checking permissions.");
  }
};

// Check if message exists and is not deleted
const checkMessageExists = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const message = await ChatMessage.findById(id);
    if (!message || message.deletedAt) {
      return sendNotFoundResponse(res, "Message not found.");
    }

    req.message = message;
    next();
  } catch (error) {
    return sendClientErrorResponse(res, "Error checking message.");
  }
};

module.exports = {
  checkMessageOwnership,
  checkMessageExists
};