const express = require('express');
const router = express.Router();
const postSchema = require('../schemas/postSchema')
const validate = require('../middlewares/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware')
const postController = require('../controllers/postController')

router.get('/', authMiddleware, postController.getFeed)
router.post('/', authMiddleware, validate(postSchema.create), postController.createPost)
router.delete('/:id', authMiddleware, postController.detelePost);

module.exports = router;
