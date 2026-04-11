const prisma = require('../config/db');

class photoService {
	async getPhotosByUserId(userId) {
		const user = await prisma.users.findUnique({ where: { id: userId } });
		if (!user) {
			throw new Error('Không tìm thấy user.');
		}

		const photos = await prisma.photos.findMany({
			where: { user_id: userId },
			orderBy: { created_at: 'desc' },
			select: {
				id: true,
				image_url: true,
				caption: true,
				created_at: true,
			},
		});

		return photos;
	}
}

module.exports = new photoService();

