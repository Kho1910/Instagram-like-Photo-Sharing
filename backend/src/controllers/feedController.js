const feedService = require('../services/feedService');

const getFeed = async ( req, res ) => {
    try {
        const userId = req.user.id;
        const lastId = parseInt(req.query.lastId);

        const feed = await feedService.getFeed(userId, lastId);

        return res.status(200).json({
            message: 'Lấy feed thành công!',
            feed
        })
        
    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        })
    }
}

module.exports = { getFeed }