# Project Directory Structure

.
├── .env
├── .env.example
├── .gitignore
├── app.js
├── config
│   ├── db.js
│   └── jwtConfig.js
├── controllers
│   ├── authController.js
│   ├── chatController.js
│   └── chatRoomController.js
├── generate_tree.sh
├── middleware
│   └── authMiddleware.js
├── models
│   ├── ChatMessage.js
│   ├── ChatRoom.js
│   └── User.js
├── package-lock.json
├── package.json
├── public
│   ├── css
│   │   └── styles.css
│   └── js
│       └── chat.js
├── routes
│   ├── authRoutes.js
│   ├── chatRoomRoutes.js
│   ├── chatRoutes.js
│   └── webRoutes.js
├── seeder.js
├── server.js
├── services
│   └── socketService.js
├── socket.js
├── swagger.js
├── tests
│   ├── auth.test.js
│   └── chat.test.js
├── uploads
├── utils
│   ├── logger.js
│   └── responseFormatter.js
└── views
    ├── chat.ejs
    ├── index.ejs
    ├── layouts
    │   └── layout.ejs
    ├── login.ejs
    └── signup.ejs

15 directories, 36 files
