const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const interactionController = require('../controllers/interactionController');

router.post('/photos/:id/like, authMiddleware, interactionController.likePhoto');

router.post('/photos/:id/unlike, authMiddleware, interactionController.unlikePhoto');

module.exports = router;
