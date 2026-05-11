const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware')

router.put('/profile', authMiddleware, userController.updateProfile);
router.get('/avatar/signature', authMiddleware, userController.getAvatarUploadSignature);
router.put('/avatar', authMiddleware, userController.updateAvatar);

router.get('/:id', authMiddleware, userController.getProfile);
router.get('/:id/posts', authMiddleware, userController.getUserPosts);
router.post('/:id/follow', authMiddleware, userController.follow);
router.delete('/:id/follow', authMiddleware, userController.unfollow);

module.exports = router;
