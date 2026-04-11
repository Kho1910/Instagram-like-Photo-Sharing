const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const photoController = require('../controllers/photoController');

router.get('/:id', userController.getProfile);
router.post('/:id/follow', userController.follow);
router.delete('/:id/follow', userController.unfollow);
router.get('/:id/photos', photoController.getPhotosByUserId);
router.put('/profile', userController.updateProfile);

module.exports = router;
