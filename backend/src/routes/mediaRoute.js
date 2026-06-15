const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware')
const mediaController = require('../controllers/mediaController')
const router = express.Router();

router.post('/upload-signature', authMiddleware, mediaController.getSignature);
router.post('/confirm', authMiddleware, mediaController.confirmMedia);
router.delete('/:publicId', () => {});

module.exports = router;