function verifyPublicKey(req, res, next) {
  const authHeader = req.headers['authorization']; 
  if (!authHeader) {
    return res.status(400).json({ error: 'Token inicial requerido' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (token !== process.env.PUBLIC_KEY) {
    return res.status(401).json({ error: 'Token inicial inválido' });
  }
  
  next();
}

module.exports = verifyPublicKey;

