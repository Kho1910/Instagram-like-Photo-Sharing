const prisma = require('../config/db');
const { notificationQueue } = require('../config/queue');

class NotificationService {
	async createNotification(recipientID, senderID, type, postID = null, commentID = null) {
		const notification = await prisma.notifications.create({
			data: {
				recipient_id: recipientID,
				sender_id: senderID,
				type,
				post_id: postID,
				comment_id: commentID,
				is_read: false,
			},
			include: {
				sender: { select: { id: true, username: true, avatar_url: true, full_name: true, }, },
				post: { select: { id: true, title: true, }, },
			},
		});

		return notification;
	}

	async queueNotification(notificationData) {
		await notificationQueue.add('send', notificationData, {
			removeOnComplete: true,
			removeOnFail: false,
			attempts: 3,
			backoff: {
				type: 'exponential',
				delay: 2000,
			},
		});
	}

	async notifyFollowed(followerID, followingID) {
		const notification = await this.createNotification(
			followingID,
			followerID,
			'follow'
		);

		await this.queueNotification({
			type: 'follow',
			recipientID: followingID,
			senderID: followerID,
			notification,
		});

		return notification;
	}

	async notifyFollowersOfNewPost(userID, postID) {
		// Get all followers
		const followers = await prisma.follows.findMany({
			where: { following_id: userID },
			select: { follower_id: true },
		});

		if (followers.length === 0) {
			return;
		}

		const notificationPromises = followers.map((follow) =>
			this.createNotification(follow.follower_id, userID, 'new_post', postID)
		);

		const notifications = await Promise.all(notificationPromises);

		const queuePromises = notifications.map((notification) =>
			this.queueNotification({
				type: 'new_post',
				recipientID: notification.recipient_id,
				senderID: userID,
				postID: postID,
				notification,
			})
		);

		await Promise.all(queuePromises);

		return notifications;
	}

	async getNotifications(userID, limit = 20, skip = 0) {
		const notifications = await prisma.notifications.findMany({
			where: { recipient_id: userID },
			include: {
				sender: {
					select: {
						id: true,
						username: true,
						avatar_url: true,
						full_name: true,
					},
				},
				post: {
					select: {
						id: true,
						title: true,
					},
				},
			},
			orderBy: { created_at: 'desc' },
			take: limit,
			skip,
		});

		return notifications;
	}

	async markAsRead(notificationID, userID) {
		const notification = await prisma.notifications.update({
			where: { id: notificationID },
			data: { is_read: true },
		});

		if (notification.recipient_id !== userID) {
			throw new Error('Không có quyền cập nhật thông báo này');
		}

		return notification;
	}

	async markAllAsRead(userID) {
		await prisma.notifications.updateMany({
			where: { recipient_id: userID, is_read: false },
			data: { is_read: true },
		});

		return true;
	}

	async deleteNotification(notificationID, userID) {
		const notification = await prisma.notifications.findUnique({
			where: { id: notificationID },
		});

		if (!notification || notification.recipient_id !== userID) {
			throw new Error('Không tìm thấy thông báo');
		}

		await prisma.notifications.delete({
			where: { id: notificationID },
		});

		return true;
	}

	async getUnreadCount(userID) {
		const count = await prisma.notifications.count({
			where: { recipient_id: userID, is_read: false },
		});

		return count;
	}
}

module.exports = new NotificationService();

