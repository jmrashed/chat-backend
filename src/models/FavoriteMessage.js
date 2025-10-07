const mongoose = require("mongoose");

const FavoriteMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatMessage",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique favorite per user per message
FavoriteMessageSchema.index({ userId: 1, messageId: 1 }, { unique: true });

const FavoriteMessage = mongoose.model("FavoriteMessage", FavoriteMessageSchema);

module.exports = FavoriteMessage;