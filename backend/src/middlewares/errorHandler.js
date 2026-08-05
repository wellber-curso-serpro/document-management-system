const multer = require('multer');
const AppError = require('../errors/AppError');

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota nao encontrada.' });
}

function errorHandler(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo excede o tamanho maximo permitido.' });
    }

    return res.status(400).json({ error: 'Falha no upload do arquivo.' });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: 'Erro interno no servidor.' });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
