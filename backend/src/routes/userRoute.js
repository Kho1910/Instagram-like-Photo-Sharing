const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:id', userController.getProfile);
router.post('/:id/follow', userController.follow);
router.delete('/:id/follow', userController.unfollow);

module.exports = router;