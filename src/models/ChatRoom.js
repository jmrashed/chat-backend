const mongoose = require("mongoose");

// Define the ChatRoom schema
const ChatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure room name is unique
  },
  description: {
    type: String,
    required: false, // Optional description for the room
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the room creation date
  },
});

// Create the ChatRoom model
const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);

// Add a method to create and save a new chat room
const createChatRoom = async (roomData) => {
  const chatRoom = new ChatRoom(roomData);
  return await chatRoom.save();
};

// Export the createChatRoom function along with the ChatRoom model
module.exports = { ChatRoom, createChatRoom };
