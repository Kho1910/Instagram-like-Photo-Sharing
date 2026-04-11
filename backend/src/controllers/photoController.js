const photoService = require('../services/photoService');

const getPhotosByUserId = async (req, res) => {
	try {
		const userId = parseInt(req.params.id);
		const photos = await photoService.getPhotosByUserId(userId);
		return res.status(200).json({ photos });
	} catch (err) {
		return res.status(400).json({
			message: 'Lấy danh sách ảnh thất bại',
			error: err.message,
		});
	}
};

module.exports = { getPhotosByUserId };

