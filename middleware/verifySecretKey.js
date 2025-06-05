const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

function verifySecretKey(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Esperamos: 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado, por favor haz login de nuevo' });
      }
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user; // Payload disponible para rutas protegidas
    next();
  });
}

module.exports = verifySecretKey;
