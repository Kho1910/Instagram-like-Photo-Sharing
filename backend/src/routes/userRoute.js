const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware')

router.get('/:id', authMiddleware, userController.getProfile);
router.post('/:id/follow', authMiddleware, userController.follow);
router.delete('/:id/follow', authMiddleware, userController.unfollow);
router.put('/profile', authMiddleware, userController.updateProfile);

module.exports = router;
