const prisma = require('../config/db')

/**
 * Lấy posts cho explore
 */
const getExplore = async (userId, lastId) => {
    const LIMIT = 20; // Lấy 20 post 1 lần

    // Lấy các danh sách post từ người chưa follow (không bao gồm bài của mình)
    const posts = await prisma.posts.findMany({
        where: {
            user_id: {
                not: userId
            },
            user: {
                followedBy: {
                    none: {
                        follower_id: userId // Lấy người mình đang không follow
                    }
                }
            },

            // removed 'views' filter so feed/explore shows posts regardless of prior views
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

module.exports = { getExplore }