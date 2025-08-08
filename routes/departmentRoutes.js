const express = require('express');
const router = express.Router();
const departmenController = require('../controllers/departmentController');
const verifySecretKey = require('../middleware/verifySecretKey');

router.use(verifySecretKey);

// Obtener todos los departamentos
router.get('/', departmenController.findAll);
// Obtener un departamento por ID
router.get('/:id', departmenController.findById);

module.exports = router;
