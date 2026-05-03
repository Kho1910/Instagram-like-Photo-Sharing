const exploreService = require('../services/exploreService')

const getExplore = async ( req, res ) => {
    try {
        const userId = req.user.id;
        const lastId = req.params.lastId;

        const explore = await exploreService.getExplore(userId, lastId);

        return res.status(200).json({
            message: 'Lấy explore thành công!',
            explore
        })
        
    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        })
    }
}

module.exports = { getExplore }