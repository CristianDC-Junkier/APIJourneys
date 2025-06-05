const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');
const verifyPublicKey = require('../middleware/verifyPublicKey');

router.use(verifyPublicKey);

router.post('/login', statusController.login);

module.exports = router;