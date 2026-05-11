const prisma = require('../config/db');
const notificationService = require('./notificationService');

class userService {
    async getProfile(userId) {
        const user = await prisma.users.findUnique({where: {id: userId}});
        if(!user) {
            throw new Error('Không tìm thấy profile');
        }

        const profile = {
            username: user.username,
            fullname: user.full_name,
            bio: user.bio,
            avatar_url: user.avatar_url
        }

        return profile;
    }

    async follow(followerId, followingId) {
        const follower = await prisma.users.findUnique({where: {id: followerId}});
        if (!follower) {
            throw new Error ('Không thấy người follow.');
        }

        const following = await prisma.users.findUnique({where: {id: followingId}});

        if (!following) {
            throw new Error ('Không thấy người được follow.');
        }

        const existingFollow = await prisma.follows.findUnique({
            where: {
                follower_id_following_id: {
                    follower_id: followerId,
                    following_id: followingId
                }
            }
        });

        if (existingFollow) {
            throw new Error('Bạn đã follow người này.');
        }

        const newFollow = await prisma.follows.create({
            data: {
                follower_id: followerId,
                following_id: followingId
            }
        });

        if (!newFollow) {
            throw new Error ('Tạo follow thất bại.');
        }

        try {
            await notificationService.notifyFollowed(followerId, followingId);
        } catch (error) {
            console.error('Lỗi khi gửi thông báo follow:', error);
        }

        return true;
    }

    async unfollow(followerId, followingId) {
        const follower = await prisma.users.findUnique({where: {id: followerId}});
        if (!follower) {
            throw new Error ('Không thấy người follow.');
        }

        const following = await prisma.users.findUnique({where: {id: followingId}});
        if (!following) {
            throw new Error ('Không thấy người được follow.');
        }

        const follow = await prisma.follows.findUnique({where: {
            follower_id: followerId,
            following_id: followingId
        }})
        if (!follow) {
            throw new Error ('Chưa follow người này.');
        }

        const deletedFollow = await prisma.follows.delete({
            where: {
                follower_id_following_id: {
                    follower_id: followerId,
                    following_id: followingId
                }
            }
        });
        if (!deletedFollow) {
            throw new Error ('Xóa follow thất bại.');
        }

        return true;
    }

	async getUserPosts(userId, limit = 10, cursorId = null) {
        const user = await prisma.users.findUnique({where: {id: userId}});
        if (!user) {
            throw new Error('Không tìm thấy user');
        }

        const where = { user_id: userId };
        const orderBy = { created_at: 'desc' };
        let take = limit;

        if (cursorId) {
            take = limit + 1;

            const cursorPost = await prisma.posts.findUnique({
                where: { id: cursorId }
            });

            if (!cursorPost) {
                throw new Error('Cursor post không tồn tại');
            }

            where.OR = [
                {
                    created_at: {
                        lt: cursorPost.created_at
                    }
                },
                {
                    AND: [
                        { created_at: cursorPost.created_at },
                        { id: { lt: cursorId } }
                    ]
                }
            ];
        }

        const posts = await prisma.posts.findMany({
            where,
            include: {
                user: { select: { id: true, username: true, avatar_url: true } },
                medias: { select: { id: true, public_id: true, resource_type: true } },
                _count: { select: { likes: true, comments: true, views: true } }
            },
            orderBy,
            take,
        });

        let hasMore = false;
        if (cursorId && posts.length > limit) {
            hasMore = true;
            posts.pop();
        }

        return {
            posts,
            hasMore,
            nextCursor: posts.length > 0 ? posts[posts.length - 1].id : null
        };
    }

    async updateProfile(userId, data) {
        const { bio, full_name, avatar_url } = data;
        const updateData = {};

        if (bio !== undefined)
	    updateData.bio = bio;
        if (full_name !== undefined)
	    updateData.full_name = full_name;
        if (avatar_url !== undefined)
	    updateData.avatar_url = avatar_url;

        if (Object.keys(updateData).length === 0) {
            throw new Error('Không có thông tin nào được cập nhật.');
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: updateData,
            select: {
                username: true,
                full_name: true,
                bio: true,
                avatar_url: true,
            },
        });

        return updatedUser;
    }
}

module.exports = new userService();
