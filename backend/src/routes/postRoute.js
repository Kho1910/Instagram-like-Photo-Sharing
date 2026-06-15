const express = require('express');
const router = express.Router();
const postSchema = require('../schemas/postSchema')
const commentSchema = require('../schemas/commentSchema')
const validate = require('../middlewares/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware')
const postController = require('../controllers/postController')

router.post('/', authMiddleware, validate(postSchema.create), postController.createPost)
router.get('/:id', authMiddleware, postController.getPost);
router.post('/:id/like', authMiddleware, postController.likePost);
router.post('/:id/unlike', authMiddleware, postController.unlikePost);
router.post('/:id/comments', authMiddleware, validate(commentSchema.create), postController.createComment);
router.delete('/:id/comments/:commentId', authMiddleware, postController.deleteComment);
router.get('/:id/comments', authMiddleware, postController.getComments);
router.post('/:id/view', authMiddleware, postController.viewPost);
router.delete('/:id', authMiddleware, postController.detelePost);

module.exports = router;
