const Message = require('../models/Message');
const path = require('path');
exports.saveMessage = async (messageData) => {  
  const message = new Message(messageData);
  await message.save();
  // Populate the sender field to get the username and email
  const populatedMessage = await Message.findById(message._id)
    .populate({
      path: 'sender', // Populate the sender field
      select: 'username email', // Select the username and email fields
    })
    .lean(); // Convert to a plain JavaScript object

  return populatedMessage; // Return the populated message object
};

exports.getMessages = async (room, limit = 50, skip = 0) => {
  return Message.find({ room })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'sender', // Populate the sender field
      select: 'username email', // Select both username and email fields from the User model
      strictPopulate: false,
    })
    .populate({
      path: 'file', // Populate the file field
      select: 'filename', // Select the filename field from the File model
    })
    .lean()
    .then(messages => {
      // Use a single BASE_URL and ensure it does not contain duplicates
      const BASE_URL = process.env.DOMAIN ? process.env.DOMAIN.replace(/\/$/, '') : 'http://localhost:3000';

      return messages.map(message => {
        const fileUrl = message.file ? `${BASE_URL}/uploads/${message.file.filename}` : null; // Ensure proper URL formation
        return { ...message, fileUrl };
      });
    });
};



