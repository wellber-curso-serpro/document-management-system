const path = require('node:path');
const crypto = require('node:crypto');
const fs = require('node:fs');
const express = require('express');
const multer = require('multer');
const documentController = require('../controllers/documentController');
const AppError = require('../errors/AppError');

const router = express.Router();
const storageDirectory = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.resolve(__dirname, '../../storage');

const maxUploadSizeInBytes = Number(process.env.MAX_UPLOAD_SIZE_BYTES || 5 * 1024 * 1024);
const allowedMimeTypes = new Set([
  'application/pdf',
  'text/plain',
  'image/png',
  'image/jpeg',
]);

fs.mkdirSync(storageDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDirectory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || '');
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxUploadSizeInBytes,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new AppError('Tipo de arquivo nao suportado.', 400));
      return;
    }

    cb(null, true);
  },
});

router.post('/upload', upload.single('file'), (req, res, next) => {
  try {
    documentController.uploadDocument(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/documents', (req, res, next) => {
  try {
    documentController.listDocuments(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/documents/:id/download', (req, res, next) => {
  try {
    documentController.downloadDocument(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
