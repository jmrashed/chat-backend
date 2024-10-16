const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const ChatRoom = require('./models/ChatRoom');
const ChatMessage = require('./models/ChatMessage');
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => // console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await ChatRoom.deleteMany({});
    await ChatMessage.deleteMany({});

    // Seed 10 unique users
    const users = [];
    for (let i = 1; i <= 10; i++) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(`password${i}`, salt);

      const user = new User({
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
      });
      users.push(await user.save());
    }

    // console.log('10 unique users have been seeded.');

    // Seed 5 unique chat rooms
    const chatRooms = [];
    const roomNames = ['general', 'random', 'tech', 'gaming', 'movies'];
    
    for (let i = 0; i < 5; i++) {
      const room = new ChatRoom({
        name: roomNames[i],
        description: `This is the ${roomNames[i]} room.`,
      });
      chatRooms.push(await room.save());
    }

    // console.log('5 unique chat rooms have been seeded.');

    // Seed 2 random chat messages per user in random rooms
    for (const user of users) {
      for (let i = 0; i < 2; i++) {
        const randomRoom = chatRooms[Math.floor(Math.random() * chatRooms.length)];
        
        const message = new ChatMessage({
          content: `Message ${i + 1} from ${user.username}`,
          sender: user._id,
          room: randomRoom._id,
        });
        
        await message.save();
      }
    }

    // console.log('Each user has been assigned 2 random chat messages.');

    // console.log('Seeding completed successfully.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding users and messages:', error);
    mongoose.connection.close();
  }
};

// Call the seed function
seedDatabase();
