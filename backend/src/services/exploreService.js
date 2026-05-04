const prisma = require('../config/db')

/**
 * Lấy posts cho explore
 */
const getExplore = async ( userId, lastId ) => {
    const LIMIT = 20; // Lấy 20 post 1 lần

    // Lấy các danh sách post
    const posts = await prisma.posts.findMany({
        where: {
            user: {
                followedBy: {
                    none: {
                        follower_id: userId // Lấy người mình đang không follow
                    }
                }
            },

            views: {
                none: {
                    viewer_id: userId
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

        select: {
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

            _count: {
                select: {
                    likes: true,
                    comments: true,
                }
            },

            medias: {
                select: {
                    public_id: true
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

module.exports = { getExplore }