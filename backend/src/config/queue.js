const { Queue, Worker } = require('bullmq');
const Valkey = require('iovalkey');

const valkey = new Valkey({
	host: process.env.REDIS_HOST || 'localhost',
	port: process.env.REDIS_PORT || 6379,
});

const notificationQueue = new Queue('notifications', {
	connection: valkey,
});

const postQueue = new Queue('posts', {
	connection: valkey,
});

module.exports = {
	notificationQueue,
	postQueue,
	valkey,
};
