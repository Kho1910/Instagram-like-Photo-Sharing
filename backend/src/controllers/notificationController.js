const notificationService = require('../services/notificationService');

const getNotifications = async (req, res) => {
	try {
		const userId = parseInt(req.user.id);
		const limit = parseInt(req.query.limit) || 20;
		const skip = parseInt(req.query.skip) || 0;

		const notifications = await notificationService.getNotifications(userId, limit, skip);

		return res.status(200).json({
			message: 'Lấy thông báo thành công',
			data: notifications,
		});
	} catch (error) {
		return res.status(400).json({
			message: 'Lỗi lấy thông báo',
			error: error.message,
		});
	}
};

const getUnreadCount = async (req, res) => {
	try {
		const userId = parseInt(req.user.id);
		const count = await notificationService.getUnreadCount(userId);

		return res.status(200).json({
			message: 'Lấy số thông báo chưa đọc thành công',
			data: { unreadCount: count },
		});
	} catch (error) {
		return res.status(400).json({
			message: 'Lỗi lấy số thông báo chưa đọc',
			error: error.message,
		});
	}
};

const markAsRead = async (req, res) => {
	try {
		const userId = parseInt(req.user.id);
		const notificationId = parseInt(req.params.id);

		const notification = await notificationService.markAsRead(notificationId, userId);

		return res.status(200).json({
			message: 'Đánh dấu đã đọc thành công',
			data: notification,
		});
	} catch (error) {
		return res.status(400).json({
			message: 'Lỗi đánh dấu đã đọc',
			error: error.message,
		});
	}
};

const markAllAsRead = async (req, res) => {
	try {
		const userId = parseInt(req.user.id);
		await notificationService.markAllAsRead(userId);

		return res.status(200).json({
			message: 'Đánh dấu tất cả đã đọc thành công',
		});
	} catch (error) {
		return res.status(400).json({
			message: 'Lỗi khi đánh dấu tất cả đã đọc',
			error: error.message,
		});
	}
};

const deleteNotification = async (req, res) => {
	try {
		const userId = parseInt(req.user.id);
		const notificationId = parseInt(req.params.id);

		await notificationService.deleteNotification(notificationId, userId);

		return res.status(200).json({
			message: 'Xóa thông báo thành công',
		});
	} catch (error) {
		return res.status(400).json({
			message: 'Lỗi xóa thông báo',
			error: error.message,
		});
	}
};

module.exports = {
	getNotifications,
	getUnreadCount,
	markAsRead,
	markAllAsRead,
	deleteNotification,
};

