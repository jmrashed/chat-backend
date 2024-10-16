const ChatRoom = require("../models/ChatRoom");
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
  // Validate user input
  const { error } = chatRoomSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map(err => err.message);
    return sendClientErrorResponse(res, errorMessages);
  }

  const { name, description } = req.body;

  try {
    // Create a new chat room
    const newChatRoom = new ChatRoom({ name, description });
    await newChatRoom.save();

    return sendCreatedResponse(res, {
      message: "Chat room created successfully.",
      chatRoom: newChatRoom,
    });
  } catch (err) {
    console.error("Error creating chat room:", err);
    return sendInternalServerErrorResponse(res, "Internal server error.");
  }
};

// Retrieve a list of all available chat rooms
const getChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find(); // Fetch all chat rooms
    return sendSuccessResponse(res, chatRooms); // Return the list of chat rooms
  } catch (err) {
    console.error("Error retrieving chat rooms:", err);
    return sendInternalServerErrorResponse(res, "Internal server error.");
  }
};

// Get details of a specific chat room
const getChatRoomDetails = async (req, res) => {
  const { roomId } = req.params;

  try {
    const chatRoom = await ChatRoom.findById(roomId); // Find chat room by ID

    if (!chatRoom) {
      return sendNotFoundResponse(res, "Chat room not found.");
    }

    return sendSuccessResponse(res, chatRoom); // Return chat room details
  } catch (err) {
    console.error("Error retrieving chat room details:", err);
    if (err.kind === "ObjectId") {
      return sendClientErrorResponse(res, "Invalid chat room ID format.");
    }
    return sendInternalServerErrorResponse(res, "Internal server error.");
  }
};

// Export the controller functions
module.exports = {
  createChatRoom,
  getChatRooms,
  getChatRoomDetails,
};
