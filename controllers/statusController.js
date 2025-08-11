const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel'); 
const secretKey = process.env.SECRET_KEY;  

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan datos de autenticación' });
  }
  try {
    const admin = await Admin.findByCredentials(username, password);
    if (!admin) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Crear JWT firmado con expiración de 30m
    const securetoken = jwt.sign({ username }, secretKey, { expiresIn: '30m' });

      return res.json({
          token: securetoken,
          id: admin.id,
          department: admin.department
      });
  } catch (error) {
    return res.status(500).json({ error: 'Error en servidor' });
  }
};



