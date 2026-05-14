const { Worker } = require('bullmq');
const { notificationQueue, valkey } = require('../config/queue');

const notificationWorker = new Worker('notifications', async (job) => {
	try {
		console.log(`\n- Đang xử lý job: ${job.id} (${job.data.type}, ${job.data.recipientID}, ${job.data.senderID})`);

		switch (job.data.type) {
			case 'follow':
				await handleFollowNotification(job.data);
				break;
			case 'like':
				await handleLikeNotification(job.data);
				break;
			case 'comment':
				await handleCommentNotification(job.data);
				break;
			case 'new_post':
				await handleNewPostNotification(job.data);
				break;
			default:
				console.warn(`- Loại thông báo không xác định: ${job.data.type}`);
		}

		console.log(`- Hoàn thành job ${job.id}.`);
		return { success: true, jobId: job.id };
	} catch (error) {
		console.error(`- Job ${job.id} thất bại:`, error.message);
		throw error;
	}
}, {
	connection: valkey,
	concurrency: 5,
});

async function handleFollowNotification(data) {
	const {
		recipientID,
		senderID,
		notification,
	} = data;

	console.log(`- ${senderID} đã theo dõi ${recipientID}`);
}

async function handleLikeNotification(data) {
	const {
		recipientID,
		senderID,
		postID,
		notification,
	} = data;

	console.log(`- ${senderID} đã thích bài #${postID}`);
}

async function handleCommentNotification(data) {
	const {
		recipientID,
		senderID,
		postID,
		commentID,
		notification,
	} = data;

	console.log(`- ${senderID} đã bình luận dưới bài #${postID}`);
}

async function handleNewPostNotification(data) {
	const {
		recipientID,
		senderID,
		postID,
		notification,
	} = data;

	console.log(`- ${senderID} vừa đăng: #${postID}`);
}

notificationWorker.on('completed', (job) => {
	console.log(`- Job ${job.id} đã xong`);
});

notificationWorker.on('failed', (job, err) => {
	console.error(`- [${job.attemptsMade}/${job.opts.attempts}] job ${job.id} thất bại:`, err.message);
});

notificationWorker.on('error', (err) => {
	console.error('- Lỗi worker:', err);
});

notificationWorker.on('active', (job) => {
	console.log(`- Job ${job.id} đang active`);
});

module.exports = notificationWorker;
