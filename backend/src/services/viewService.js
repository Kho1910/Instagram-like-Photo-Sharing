const prisma = require('../config/db');

class ViewService {
	async recordView(userId, postId) {
		const user = await prisma.users.findUnique({ where: { id: userId } });
		if (!user) {
			throw new Error('User không tồn tại');
		}

		const post = await prisma.posts.findUnique({ where: { id: postId } });
		if (!post) {
			throw new Error('Post không tồn tại');
		}

		const view = await prisma.views.upsert({
			where: {
				viewer_id_post_id: {
					viewer_id: userId,
					post_id: postId,
				},
			},

			update: {
				created_at: new Date(),
			},

			create: {
				viewer_id: userId,
				post_id: postId,
			},
		});

		return view;
	}

	async getViewCount(postId) {
		const count = await prisma.views.count({
			where: { post_id: postId },
		});

		return count;
	}

	async getViewCounts(postIds) {
		const views = await prisma.views.groupBy({
			by: ['post_id'],
			where: {
				post_id: { in: postIds },
			},
			_count: true,
		});

		return views.reduce((acc, view) => {
			acc[view.post_id] = view._count;
			return acc;
		}, {});
	}

	async hasViewed(userId, postId) {
		const view = await prisma.views.findUnique({
			where: {
				viewer_id_post_id: {
					viewer_id: userId,
					post_id: postId,
				},
			},
		});

		return !!view;
	}
}

module.exports = new ViewService();

