const ChatRoom = require("../models/ChatRoom");
const mongoose = require("mongoose");
const Joi = require("joi");
const {
  sendResponse,
  sendSuccessResponse,
  sendCreatedResponse,
  sendUpdatedResponse,
  sendDeletedResponse,
  sendClientErrorResponse,
  sendNotFoundResponse,
  sendInternalServerErrorResponse,
  sendUnauthorizedResponse,
} = require("../utils/responseFormatter"); // Corrected import path

// Define a validation schema for creating a chat room
const chatRoomSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.base": `"name" should be a type of 'text'`,
      "string.empty": `"name" cannot be an empty field`,
      "string.min": `"name" should have a minimum length of {#limit}`,
      "string.max": `"name" should have a maximum length of {#limit}`,
      "any.required": `"name" is a required field`,
    }),
  description: Joi.string()
    .max(200)
    .optional()
    .messages({
      "string.base": `"Description" should be a type of 'text'`,
      "string.max": `"Description" should have a maximum length of {#limit}`,
    }),
});

// Create a new chat room
const createChatRoom = async (req, res) => {
  try {
    // Validate user input
    const { error } = chatRoomSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map(err => err.message);
      return sendClientErrorResponse(res, "Validation failed", errorMessages);
    }

    const { name, description } = req.body;

    // Check if room with same name already exists
    const existingRoom = await ChatRoom.findOne({ name });
    if (existingRoom) {
      return sendClientErrorResponse(res, "Room name already exists", ["A room with this name already exists"]);
    }

    // Create a new chat room
    const newChatRoom = new ChatRoom({ name, description });
    await newChatRoom.save();

    return sendCreatedResponse(res, "Chat room created successfully.", newChatRoom);
  } catch (err) {
    console.error("Error creating chat room:", err);
    if (err.code === 11000) {
      return sendClientErrorResponse(res, "Room name already exists", ["A room with this name already exists"]);
    }
    return sendInternalServerErrorResponse(res, "Failed to create chat room");
  }
};

// Retrieve a list of all available chat rooms
const getChatRooms = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sort]: order === 'desc' ? -1 : 1 }
    };

    const chatRooms = await ChatRoom.find()
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);
    
    const total = await ChatRoom.countDocuments();
    
    return sendSuccessResponse(res, "Chat rooms retrieved successfully", chatRooms, {
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (err) {
    console.error("Error retrieving chat rooms:", err);
    return sendInternalServerErrorResponse(res, "Failed to retrieve chat rooms");
  }
};

// Get details of a specific chat room
const getChatRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return sendClientErrorResponse(res, "Invalid room ID format", ["Room ID must be a valid ObjectId"]);
    }

    const chatRoom = await ChatRoom.findById(roomId).populate('users', 'username email');

    if (!chatRoom) {
      return sendNotFoundResponse(res, "Chat room not found");
    }

    return sendSuccessResponse(res, "Chat room details retrieved successfully", chatRoom);
  } catch (err) {
    console.error("Error retrieving chat room details:", err);
    return sendInternalServerErrorResponse(res, "Failed to retrieve chat room details");
  }
};

// Export the controller functions
module.exports = {
  createChatRoom,
  getChatRooms,
  getChatRoomDetails,
};
