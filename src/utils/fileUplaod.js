const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer storage
const storage = multer.memoryStorage(); // Use memory storage for streaming
const upload = multer({ storage });

// Save file to disk using a stream
const saveFileToDisk = (file, destination) => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(destination);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    writeStream.write(file.buffer);
    writeStream.end();
  });
};

module.exports = { upload, saveFileToDisk };
