const fileService = require('../services/fileService');
const logger = require('../utils/logger');

exports.uploadFile = async (req, res, next) => {
  try {
    const file = await fileService.saveFile({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.userId
    });
    res.status(201).json({ fileId: file._id });
  } catch (error) {
    logger.error('File upload error:', error);
    next(error);
  }
};

exports.getFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const file = await fileService.getFile(fileId);
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `attachment; filename="${file.filename}"`);
    const fileStream = fileService.streamFile(fileId);
    fileStream.pipe(res);
  } catch (error) {
    logger.error('Get file error:', error);
    next(error);
  }
};