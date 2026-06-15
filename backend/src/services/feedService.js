const prisma = require('../config/db')

/**
 * Lấy posts cho feed
 */
const getFeed = async (userId, lastId) => {
    const LIMIT = 20; // Lấy 20 post 1 lần

    // Lấy các danh sách post của bạn và người bạn follow
    const posts = await prisma.posts.findMany({
        // where: {
        //     OR: [
        //         { user_id: userId },
        //         {
        //             user: {
        //                 followedBy: {
        //                     some: {
        //                         follower_id: userId
        //                     }
        //                 }
        //             }
        //         }
        //     ],

        //     // Không cần điều kiện để lấy toàn bộ bài post
        // },

        orderBy: {
            created_at: 'desc'
        },

        take: LIMIT,

        cursor: lastId
            ? { id: Number(lastId) }
            : undefined,

        skip: lastId ? 1 : 0,

        select: {
            id: true,
            user_id: true,
            title: true,
            content: true,
            created_at: true,

            user: {
                select: {
                    id: true,
                    username: true,
                    full_name: true,
                    avatar_url: true
                }
            },

            likes: {
                where: {
                    user_id: userId
                },
                select: {
                    user_id: true
                }
            },

            _count: {
                select: {
                    likes: true,
                    comments: true,
                }
            },

            medias: {
                select: {
                    id: true,
                    public_id: true
                }
            }
        }
    });

    if (posts.length === 0) return [];

    const normalizedPosts = posts.map(({ likes, ...post }) => ({
        ...post,
        is_liked: (likes?.length || 0) > 0
    }))

    return {
        posts: normalizedPosts,
        lastId: normalizedPosts[normalizedPosts.length - 1].id
    }
}

module.exports = { getFeed }