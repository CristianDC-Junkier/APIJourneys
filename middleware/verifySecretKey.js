const jwt = require('jsonwebtoken');
const path = require('path');
const secretKey = process.env.SECRET_KEY;
const { respondWithError, respondNotFound } = require('../controllers/errorsController');

function verifySecretKey(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return respondWithError(req, res, 401, 'Token requerido');
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return respondWithError(req, res, 401, 'Token expirado');
            }
            return respondWithError(req, res, 403, 'Token inválido');
        }

        req.user = user;
        next();
    });
}

module.exports = verifySecretKey;
