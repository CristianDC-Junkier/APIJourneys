const path = require('path');
const { respondWithError, respondNotFound } = require('../controllers/errorsController');

function verifyPublicKey(req, res, next) {
  const authHeader = req.headers['authorization']; 
    if (!authHeader) {
        return respondWithError(req, res, 400, 'Token inicial requerido');
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (token !== process.env.PUBLIC_KEY) {
        return respondWithError(req, res, 400, 'Token inicial inválido');
  }
  
  next();
}

module.exports = verifyPublicKey;

