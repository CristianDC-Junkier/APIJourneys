const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travelController');
const verifySecretKey = require('../middleware/verifySecretKey');

router.use(verifySecretKey);

// Obtener todos los viajes
router.get('/', travelController.findAll);
// Obtener todos los viajes por departamento
router.get('/department/:id', travelController.findByDepartment);
// Obtener un viaje por ID
router.get('/:id', travelController.findById);
// Crear un nuevo viaje
router.post('/', travelController.create);
// Modificar un viaje por ID
router.put('/:id', travelController.modify);
// Eliminar un viaje por ID
router.delete('/:id', travelController.delete);

module.exports = router;
