const mongoose = require("mongoose");

// Define the ChatMessage schema
const ChatMessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  },
  // Message Reactions
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Message Editing/Deletion
  editedAt: {
    type: Date
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  // Message Threads/Replies
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatMessage"
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatMessage"
  },
  // Mentions
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  // Message Status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Pinned Messages
  pinned: {
    type: Boolean,
    default: false
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  pinnedAt: {
    type: Date
  }
});


const newMessage = async (messageData) => {
  const message = new Message(messageData);
  return await message.save();
};
// Create the ChatMessage model
const Message = mongoose.model("ChatMessage", ChatMessageSchema);



module.exports = Message;
