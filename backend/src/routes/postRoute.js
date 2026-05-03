const express = require('express');
const router = express.Router();
const postSchema = require('../schemas/postSchema')
const validate = require('../middlewares/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware')
const postController = require('../controllers/postController')

router.post('/', authMiddleware, validate(postSchema.create), postController.createPost)
router.delete('/:id', authMiddleware, postController.detelePost);
router.get('/:id/comments', authMiddleware, postController.getComments);

module.exports = router;