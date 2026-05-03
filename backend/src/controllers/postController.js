const postService = require('../services/postService')

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

        return res.status(204);
        
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

        const comments = await postService.getComments(postId, lastId);

        return res.status(200).json({
            message: 'Lấy message thành công!',
            comments
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        })
    }
}

module.exports = { createPost, detelePost, getComments }