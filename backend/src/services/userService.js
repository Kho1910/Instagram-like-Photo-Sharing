const prisma = require('../config/db');

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
        const follower = await prisma.findUnique({where: {id: followerId}});
        if (!follower) {
            throw new Error ('Không thấy người follow.');
        }

        const following = await prisma.findUnique({where: {id: followingId}});
        if (!following) {
            throw new Error ('Không thấy người được follow.');
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

        return true;
    }

    async unfollow(followerId, followingId) {
        const follower = await prisma.findUnique({where: {id: followerId}});
        if (!follower) {
            throw new Error ('Không thấy người follow.');
        }

        const following = await prisma.findUnique({where: {id: followingId}});
        if (!following) {
            throw new Error ('Không thấy người được follow.');
        }

        const follow = await prisma.follows.findUnique({where: {
            follower_id: followerId,
            following_id: followerId
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
}

module.exports = new userService();