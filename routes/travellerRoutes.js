const express = require('express');
const router = express.Router();
const travellerController = require('../controllers/travellerController');
const verifySecretKey = require('../middleware/verifySecretKey');

router.use(verifySecretKey);

// Obtener todos los viajeros
router.get('/', travellerController.findAll);
// Obtener todos los viajeros por departamento
router.get('/department/:id', travellerController.findAll);
// Obtener un viajero por ID
router.get('/:id', travellerController.findById);
// Crear un nuevo viajero
router.post('/', travellerController.create);
// Modificar un viajero por ID
router.put('/:id', travellerController.modify);
// Eliminar un viajero por ID
router.delete('/:id', travellerController.delete);

module.exports = router;
