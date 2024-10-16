const mongoose = require("mongoose");

// Define the ChatMessage schema
const ChatMessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom", // Reference to the ChatRoom model
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now, // Set default to current time
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  },
});


const newMessage = async (messageData) => {
  const message = new Message(messageData);
  return await message.save();
};
// Create the ChatMessage model
const Message = mongoose.model("ChatMessage", ChatMessageSchema);



module.exports = Message;
