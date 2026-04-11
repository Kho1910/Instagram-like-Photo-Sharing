const express = require('express');
const router = express.Router();
const authSchema = require('../schemas/authSchema');
const validate = require('../middlewares/validateMiddleware');
const authController = require('../controllers/authController');


router.post('/register', validate(authSchema.register), authController.register);
router.post('/login', validate(authSchema.login), authController.login);
router.post('/forgotPassword', validate(authSchema.forgotPassword), authController.forgotPassword);
router.post('/resetPassword', validate(authSchema.resetPassword), authController.resetPassword);

module.exports = router;