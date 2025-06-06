const { respondWithError, respondNotFound } = require('../controllers/errorsController');

function notFoundHandler(req, res) {
    respondNotFound(req, res, 404, `Ruta ${req.originalUrl} no encontrada`);
}

module.exports = notFoundHandler;

