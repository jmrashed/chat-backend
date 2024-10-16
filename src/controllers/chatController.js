const Joi = require("joi");
const ChatMessage = require("../models/Message");
const User = require("../models/User"); // Assuming you have a User model
const ChatRoom = require("../models/ChatRoom"); // Assuming you have a ChatRoom model
const {
  sendSuccessResponse,
  sendCreatedResponse,
  sendClientErrorResponse,
  sendNotFoundResponse,
  sendInternalServerErrorResponse,
} = require("../utils/responseFormatter"); // Corrected import path

// Validation schema for messages
const messageSchema = Joi.object({
  content: Joi.string().required().label("content"),
  sender: Joi.string().required().label("sender"),
  room: Joi.string().required().label("room"),
});

// Validation schema for file uploads
const uploadFileSchema = Joi.object({
  room: Joi.string().required().label("Room"),
});

// Controller for sending a message
const sendMessage = async (req, res) => {
  // Validate incoming request body
  const { error } = messageSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map(err => err.message);
    return sendClientErrorResponse(res, "Validation failed", errorMessages);
  }

  const { content, sender, room } = req.body;

  try {
    // Validate sender existence
    const userExists = await User.findById(sender);
    if (!userExists) {
      return sendNotFoundResponse(res, "Sender not found.");
    }

    // Validate room existence
    const roomExists = await ChatRoom.findById(room);
    if (!roomExists) {
      return sendNotFoundResponse(res, "Room not found.");
    }

    // Create and save the message
    const message = new ChatMessage({ content, sender, room });
    await message.save();

    return sendCreatedResponse(res, { message: "Message sent successfully", data: message });
  } catch (err) {
    console.error("Error sending message:", err);
    return sendInternalServerErrorResponse(res, "Error sending message.");
  }
};

// Controller for retrieving messages for a specific room
const getMessages = async (req, res) => {
  const { room } = req.params;

  try {
    // Validate room existence
    const roomExists = await ChatRoom.findById(room);
    if (!roomExists) {
      return sendNotFoundResponse(res, "Room not found.");
    }

    // Fetch messages for the room
    const messages = await ChatMessage.find({ room }).sort({ createdAt: -1 });
    return sendSuccessResponse(res, messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return sendInternalServerErrorResponse(res, "Error fetching messages.");
  }
};

// Controller for uploading a file
const uploadFile = async (req, res) => {
  // Validate incoming request body
  const { error } = uploadFileSchema.validate(req.body);
  const file = req.file; // Assumes multer is being used to handle file uploads

  if (error) {
    return sendClientErrorResponse(res, error.details[0].message);
  }

  if (!file) {
    return sendClientErrorResponse(res, "File is required.");
  }

  try {
    // Logic to handle file upload (e.g., saving to cloud storage)
    const filePath = file.path; // Path to the uploaded file
    return sendCreatedResponse(res, { success: true, message: "File uploaded successfully!", filePath });
  } catch (err) {
    console.error("Error uploading file:", err);
    return sendInternalServerErrorResponse(res, "Error uploading file.");
  }
};

module.exports = {
  sendMessage,
  getMessages,
  uploadFile,
};
