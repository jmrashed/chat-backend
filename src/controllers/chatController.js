const Joi = require("joi");
const ChatMessage = require("../models/Message");
const User = require("../models/User");
const ChatRoom = require("../models/ChatRoom");
const FavoriteMessage = require("../models/FavoriteMessage");
const {
  sendSuccessResponse,
  sendCreatedResponse,
  sendClientErrorResponse,
  sendNotFoundResponse,
  sendInternalServerErrorResponse,
} = require("../utils/responseFormatter");

// Validation schemas
const messageSchema = Joi.object({
  content: Joi.string().required().label("content"),
  sender: Joi.string().required().label("sender"),
  room: Joi.string().required().label("room"),
  replyTo: Joi.string().optional().label("replyTo"),
  mentions: Joi.array().items(Joi.string()).optional().label("mentions")
});

const reactionSchema = Joi.object({
  emoji: Joi.string().required().label("emoji")
});

const editMessageSchema = Joi.object({
  content: Joi.string().required().label("content")
});

const searchSchema = Joi.object({
  query: Joi.string().required().label("query"),
  room: Joi.string().required().label("room"),
  page: Joi.number().integer().min(1).default(1).label("page"),
  limit: Joi.number().integer().min(1).max(100).default(20).label("limit")
});

// Validation schema for file uploads
const uploadFileSchema = Joi.object({
  room: Joi.string().required().label("Room"),
});

// Extract mentions from message content
const extractMentions = async (content) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    const user = await User.findOne({ username: match[1] });
    if (user) mentions.push(user._id);
  }
  
  return mentions;
};

// Controller for sending a message
const sendMessage = async (req, res) => {
  const { error } = messageSchema.validate(req.body);
  if (error) {
    return sendClientErrorResponse(res, "Validation failed", error.details.map(err => err.message));
  }

  const { content, sender, room, replyTo } = req.body;

  try {
    const userExists = await User.findById(sender);
    if (!userExists) return sendNotFoundResponse(res, "Sender not found.");

    const roomExists = await ChatRoom.findById(room);
    if (!roomExists) return sendNotFoundResponse(res, "Room not found.");

    // Extract mentions
    const mentions = await extractMentions(content);
    
    // Set threadId for replies
    let threadId = null;
    if (replyTo) {
      const parentMessage = await ChatMessage.findById(replyTo);
      threadId = parentMessage?.threadId || replyTo;
    }

    const message = new ChatMessage({ 
      content, 
      sender, 
      room, 
      replyTo, 
      threadId, 
      mentions,
      status: 'sent'
    });
    await message.save();

    return sendCreatedResponse(res, { message: "Message sent successfully", data: message });
  } catch (err) {
    console.error("Error sending message:", err);
    return sendInternalServerErrorResponse(res, "Error sending message.");
  }
};

// Controller for retrieving messages
const getMessages = async (req, res) => {
  const { room } = req.params;
  const { page = 1, limit = 20, includeDeleted = false } = req.query;

  try {
    const roomExists = await ChatRoom.findById(room);
    if (!roomExists) return sendNotFoundResponse(res, "Room not found.");

    const filter = { room };
    if (!includeDeleted) filter.deletedAt = { $exists: false };

    const messages = await ChatMessage.find(filter)
      .populate('sender', 'username')
      .populate('replyTo', 'content sender')
      .populate('reactions.userId', 'username')
      .sort({ pinned: -1, timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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

// Add reaction to message
const addReaction = async (req, res) => {
  const { error } = reactionSchema.validate(req.body);
  if (error) return sendClientErrorResponse(res, "Validation failed", error.details.map(err => err.message));

  const { id } = req.params;
  const { emoji } = req.body;
  const userId = req.user.id;

  try {
    const message = await ChatMessage.findById(id);
    if (!message) return sendNotFoundResponse(res, "Message not found.");

    const existingReaction = message.reactions.find(r => r.userId.toString() === userId && r.emoji === emoji);
    if (existingReaction) {
      return sendClientErrorResponse(res, "Reaction already exists.");
    }

    message.reactions.push({ userId, emoji });
    await message.save();

    return sendSuccessResponse(res, { message: "Reaction added successfully" });
  } catch (err) {
    return sendInternalServerErrorResponse(res, "Error adding reaction.");
  }
};

// Remove reaction from message
const removeReaction = async (req, res) => {
  const { id, reactionId } = req.params;
  const userId = req.user.id;

  try {
    const message = await ChatMessage.findById(id);
    if (!message) return sendNotFoundResponse(res, "Message not found.");

    const reaction = message.reactions.id(reactionId);
    if (!reaction || reaction.userId.toString() !== userId) {
      return sendNotFoundResponse(res, "Reaction not found.");
    }

    message.reactions.pull(reactionId);
    await message.save();

    return sendSuccessResponse(res, { message: "Reaction removed successfully" });
  } catch (err) {
    return sendInternalServerErrorResponse(res, "Error removing reaction.");
  }
};

// Edit message
const editMessage = async (req, res) => {
  const { error } = editMessageSchema.validate(req.body);
  if (error) return sendClientErrorResponse(res, "Validation failed", error.details.map(err => err.message));

  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const message = await ChatMessage.findById(id);
    if (!message) return sendNotFoundResponse(res, "Message not found.");
    if (message.sender.toString() !== userId) {
      return sendClientErrorResponse(res, "Unauthorized to edit this message.");
    }

    message.content = content;
    message.editedAt = new Date();
    message.mentions = await extractMentions(content);
    await message.save();

    return sendSuccessResponse(res, { message: "Message edited successfully", data: message });
  } catch (err) {
    return sendInternalServerErrorResponse(res, "Error editing message.");
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const message = await ChatMessage.findById(id);
    if (!message) return sendNotFoundResponse(res, "Message not found.");
    if (message.sender.toString() !== userId) {
      return sendClientErrorResponse(res, "Unauthorized to delete this message.");
    }

    message.deletedAt = new Date();
    message.deletedBy = userId;
    await message.save();

    return sendSuccessResponse(res, { message: "Message deleted successfully" });
  } catch (err) {
    return sendInternalServerErrorResponse(res, "Error deleting message.");
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const message = await ChatMessage.findById(id);
    if (!message) return sendNotFoundResponse(res, "Message not found.");

    const alreadyRead = message.readBy.find(r => r.userId.toString() === userId);
    if (!alreadyRead) {
      message.readBy.push({ userId });
      message.status = 'read';
      await message.save();
    }

    return sendSuccessResponse(res, { message: "Message marked as read" });
  } catch (err) {
    return sendInternalServerErrorResponse(res, "Error marking message as read.");
  }
};

// Search messages
const searchMessages = async (req, res) => {
  const { error } = searchSchema.validate(req.query);
  if (error) return sendClientErrorResponse(res, "Validation failed", error.details.map(err => err.message));

  const { query, room, page, limit } = req.query;

  try {
    const messages = await ChatMessage.find({
      room,
      content: { $regex: query, $options: 'i' },
      deletedAt: { $exists: false }
    })
    .populate('sender', 'username')
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    return sendSuccessResponse(res, messages);
  } catch (err) {
    return sendInternalServerErrorResponse(res, "Error searching messages.");
  }
};

// Pin message
const pinMessage = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const message = await ChatMessage.findById(id);
    if (!message) return sendNotFoundResponse(res, "Message not found.");

    message.pinned = !message.pinned;
    if (message.pinned) {
      message.pinnedBy = userId;
      message.pinnedAt = new Date();
    } else {
      message.pinnedBy = undefined;
      message.pinnedAt = undefined;
    }
    await message.save();

    return sendSuccessResponse(res, { message: `Message ${message.pinned ? 'pinned' : 'unpinned'} successfully` });
  } catch (err) {
    return sendInternalServerErrorResponse(res, "Error pinning message.");
  }
};

// Add to favorites
const addFavorite = async (req, res) => {
  const { messageId } = req.body;
  const userId = req.user.id;

  try {
    const favorite = new FavoriteMessage({ userId, messageId });
    await favorite.save();
    return sendCreatedResponse(res, { message: "Message added to favorites" });
  } catch (err) {
    if (err.code === 11000) {
      return sendClientErrorResponse(res, "Message already in favorites.");
    }
    return sendInternalServerErrorResponse(res, "Error adding to favorites.");
  }
};

// Remove from favorites
const removeFavorite = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  try {
    await FavoriteMessage.findOneAndDelete({ userId, messageId });
    return sendSuccessResponse(res, { message: "Message removed from favorites" });
  } catch (err) {
    return sendInternalServerErrorResponse(res, "Error removing from favorites.");
  }
};

// Get user favorites
const getFavorites = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  try {
    const favorites = await FavoriteMessage.find({ userId })
      .populate({
        path: 'messageId',
        populate: { path: 'sender', select: 'username' }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    return sendSuccessResponse(res, favorites);
  } catch (err) {
    return sendInternalServerErrorResponse(res, "Error fetching favorites.");
  }
};

module.exports = {
  sendMessage,
  getMessages,
  uploadFile,
  addReaction,
  removeReaction,
  editMessage,
  deleteMessage,
  markAsRead,
  searchMessages,
  pinMessage,
  addFavorite,
  removeFavorite,
  getFavorites
};
