const postService = require('../services/postService')
const prisma = require('../config/db')

const createPost = async ( req, res ) => {
    try {
        const userId = req.user.id;
        const postData = req.body;
        const { newPost }= await postService.createPost(userId, postData);

        return res.status(201).json({
            post: newPost
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        })
    } 
}

const detelePost = async ( req, res ) => {
    try {
        const userId = req.user.id;
        const postId = parseInt(req.params.id);
        await postService.deletePost( userId, postId );

        return res.status(204).send();
        
    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        })
    }
}

const getComments = async ( req, res ) => {
    try {
        const postId = parseInt(req.params.id);
        const lastId = parseInt(req.query.lastId);

        const result = await postService.getComments(postId, lastId);
        const comments = result.comments || [];

        return res.status(200).json({
            message: 'Lấy message thành công!',
            comments,
            lastId: result.lastId || null
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        })
    }
}

const viewPost = async ( req, res ) => {
	try {
		const userId = parseInt(req.user.id);
		const postId = parseInt(req.params.id);

		const result = await postService.viewPost(userId, postId);

		return res.status(200).json({
			message: 'Ghi nhận view thành công',
			data: result
		})

	} catch (error) {
		return res.status(400).json({
			message: 'Lỗi server',
			error: error.message
		})
	}
}

const likePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = parseInt(req.params.id);

        await postService.likePost(userId, postId);
        const likeCount = await prisma.likes.count({ where: { post_id: postId } });

        return res.status(201).json({
            message: 'Thích bài đăng thành công',
            data: { like_count: likeCount, liked: true }
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Không thể like bài đăng',
            error: error.message
        });
    }
}

const unlikePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = parseInt(req.params.id);

        await postService.unlikePost(userId, postId);
        const likeCount = await prisma.likes.count({ where: { post_id: postId } });

        return res.status(200).json({
            message: 'Bỏ thích bài đăng thành công',
            data: { like_count: likeCount, liked: false }
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Không thể bỏ thích bài đăng',
            error: error.message
        });
    }
}

const createComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = parseInt(req.params.id);
        const commentData = req.body;

        const comment = await postService.createComment(userId, postId, commentData);

        return res.status(201).json({
            message: 'Bình luận thành công',
            comment
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Không thể tạo bình luận',
            error: error.message
        });
    }
}

const deleteComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = parseInt(req.params.id);
        const commentId = parseInt(req.params.commentId);

        await postService.deleteComment(userId, postId, commentId);

        return res.status(200).json({
            message: 'Xóa bình luận thành công'
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Không thể xóa bình luận',
            error: error.message
        });
    }
}

module.exports = { createPost, detelePost, getComments, viewPost, likePost, unlikePost, createComment, deleteComment }
