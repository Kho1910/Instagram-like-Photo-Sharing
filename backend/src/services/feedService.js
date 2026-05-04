const prisma = require('../config/db')

/**
 * Lấy posts cho feed
 */
const getFeed = async ( userId, lastId ) => {
    const LIMIT = 20; // Lấy 20 post 1 lần

    // Lấy các danh sách post
    const posts = await prisma.posts.findMany({
        where: {
            user: {
                followedBy: {
                    some: {
                        follower_id: userId // Lấy post của những user mình đang follow
                    }
                }
            },

            views: {
                none: {
                    viewer_id: userId // Tránh hiện lại post cũ
                }
            }
        },

        orderBy: {
            created_at: 'desc'
        },

        take: LIMIT,

        cursor: lastId
        ? { id: Number(lastId) }
        : undefined,

        skip: lastId ? 1 : 0,

        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    full_name: true,
                    avatar_url: true
                }
            },

            _count: {
                select: {
                    likes: true,
                    comments: true,
                }
            }
        }
    });

    if (posts.length === 0) return [];

    return {
        posts,
        lastId: posts[posts.length - 1].id
    }
}

module.exports = { getFeed }