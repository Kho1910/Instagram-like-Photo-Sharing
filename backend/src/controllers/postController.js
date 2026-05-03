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

const getFeed = async (req, res) => {
    try {
        const posts = await postService.getFeed()
        return res.status(200).json({ posts })
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

module.exports = { createPost, detelePost, getFeed };
