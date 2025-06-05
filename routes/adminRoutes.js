const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifySecretKey = require('../middleware/verifySecretKey');

router.use(verifySecretKey);

// Obtener todos los administradores
router.get('/', adminController.findAll);
// Obtener un administrador por ID
router.get('/:id', adminController.findById);
// Crear un nuevo administrador
router.post('/', adminController.create);
// Modificar un administrador existente
router.put('/:id', adminController.modify);
// Eliminar un administrador
router.delete('/:id', adminController.delete);

module.exports = router;
