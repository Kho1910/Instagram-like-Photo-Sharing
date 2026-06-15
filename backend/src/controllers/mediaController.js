const mediaService = require('../services/mediaService')

const getSignature = async ( req, res ) => {
    try {        
        const userId = req.user.id;        
        if(!userId) {
            return res.status(400).json({
                message: 'Request không hợp lệ,'
            });
        }
        const data = await mediaService.getSignature(userId);
        return res.status(201).json({
            message: 'Tạo signature thành công!',
            data
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        })
    }
}

const confirmMedia = async ( req, res ) => {
    try {
        const userId = parseInt(req.user.id);        
        if(!userId) {
            return res.status(400).json({
                message: 'Request không hợp lệ,'
            });
        }

        const { publicId, resourceType } = req.body;
        const data = await mediaService.confirmMedia(userId, publicId, resourceType);
        return res.status(201).json({
            message: 'Tạo dữ liệu media trong database thành công!',
            data
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        })
    }
}

module.exports = { getSignature, confirmMedia }