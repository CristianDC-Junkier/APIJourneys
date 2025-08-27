const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const verifySecretKey = require('../middleware/verifySecretKey');

router.use(verifySecretKey);

// Obtener todos los trabajadores
router.get('/', workerController.findAll);
// Obtener un trabajador por ID
router.get('/:id', workerController.findById);
// Crear un nuevo trabajador
router.post('/', workerController.create);
// Modificar un trabajador existente
router.put('/:id', workerController.modify);
// Eliminar un trabajador
router.delete('/:id', workerController.delete);

module.exports = router;
