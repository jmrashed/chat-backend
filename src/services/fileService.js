const mongoose = require('mongoose');
const File = require('../models/File');
const logger = require('../utils/logger');
const crypto = require('crypto');

class FileService {
  constructor() {
    this.tempUploads = new Map();
  }

  // Ensure connection to MongoDB before accessing GridFSBucket
  async initializeBucket() {
    if (!this.bucket) {
      if (!mongoose.connection.db) {
        throw new Error('MongoDB connection is not yet established.');
      }
      this.bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
    }
  }

  async initializeFileUpload(fileInfo, userId) {
    await this.initializeBucket(); // Ensure the bucket is initialized

    const uploadId = crypto.randomBytes(16).toString('hex');
    const uploadStream = this.bucket.openUploadStream(fileInfo.name, {
      metadata: { userId }
    });

    this.tempUploads.set(uploadId, {
      stream: uploadStream,
      fileInfo
    });

    logger.info(`File upload initialized: ${uploadId}`);
    return uploadId;
  }

  async appendFileChunk(uploadId, chunk, index) {
    const upload = this.tempUploads.get(uploadId);
    if (!upload) {
      throw new Error('Upload not found');
    }

    return new Promise((resolve, reject) => {
      upload.stream.write(chunk, (error) => {
        if (error) {
          logger.error(`Error appending chunk ${index} for upload ${uploadId}:`, error);
          reject(error);
        } else {
          logger.info(`Chunk ${index} appended for upload ${uploadId}`);
          resolve();
        }
      });
    });
  }

  async finalizeFileUpload(uploadId) {
    const upload = this.tempUploads.get(uploadId);
    if (!upload) {
      throw new Error('Upload not found');
    }

    return new Promise((resolve, reject) => {
      upload.stream.end((error) => {
        if (error) {
          logger.error(`Error finalizing upload ${uploadId}:`, error);
          reject(error);
        } else {
          const file = new File({
            filename: upload.fileInfo.name,
            fileId: upload.stream.id,
            size: upload.stream.length,
            userId: upload.stream.options.metadata.userId
          });
          file.save()
            .then((savedFile) => {
              logger.info(`File upload finalized: ${uploadId}`);
              this.tempUploads.delete(uploadId);
              resolve(savedFile);
            })
            .catch((saveError) => {
              logger.error(`Error saving file for upload ${uploadId}:`, saveError);
              reject(saveError);
            });
        }
      });
    });
  }

  async getFileStream(fileId) {
    await this.initializeBucket(); // Ensure the bucket is initialized

    const file = await File.findOne({ fileId: new mongoose.Types.ObjectId(fileId) });
    if (!file) {
      throw new Error('File not found');
    }

    const downloadStream = this.bucket.openDownloadStream(file.fileId);
    logger.info(`File stream requested: ${fileId}`);
    return downloadStream;
  }

  async deleteFile(fileId) {
    await this.initializeBucket(); // Ensure the bucket is initialized

    const file = await File.findOne({ fileId: new mongoose.Types.ObjectId(fileId) });
    if (!file) {
      throw new Error('File not found');
    }

    await this.bucket.delete(file.fileId);
    await File.deleteOne({ _id: file._id });
    logger.info(`File deleted: ${fileId}`);
  }
}

module.exports = new FileService();
