const prisma = require('../config/db');

class interactionService {
    async likePhoto(userID, postID) {
        const post = await prisma.posts.findUnique({ where: { id: postID } });
        if (!post) throw new Error("Bài đăng này không tồn tại!");

        await prisma.likes.upsert({
            where: {
                user_id_post_id: {
                    user_id: userID,
                    post_id: postID,
                },
            },
            update: {},
            create: {
                user_id: userID,
                post_id: postID,
            },
        });

        return await prisma.likes.count({ where: { post_id: postID } });
    }

    async unlikePhoto(userID, postID) {
        await prisma.likes.delete({
            where: {
                user_id_post_id: {
                    user_id: userID,
                    post_id: postID,
                },
            },
        });

        return await prisma.likes.count({ where: { post_id: postID } });
    }
}

module.exports = new interactionService();