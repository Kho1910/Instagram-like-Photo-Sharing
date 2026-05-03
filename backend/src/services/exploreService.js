const prisma = require('../config/db')
const { calculatePostScore } = require('./discoveryService')

/**
 * Lấy posts cho explore
 */
const getExplore = async ( userId, lastId ) => {
    const LIMIT = 20; // Lấy 20 post 1 lần

    // Lấy các danh sách post
    const candidates = await prisma.posts.findMany({
        where: {
            user: {
                followedBy: {
                    none: {
                        follower_id: userId // Lấy người mình đang không follow
                    }
                }
            }
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
                    views: {
                        where: { viewer_id: userId }
                    }
                }
            }
        }
    });

    if (candidates.length === 0) return [];

    const rankedPosts = candidates.map( post => {
        const score = calculatePostScore(post);
        return { ...post, relevanceScore: score } // Thêm điểm
    })

    // Sắp xếp giảm dần theo điểm
    rankedPosts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
        rankedPosts,
        lastId: rankedPosts[rankedPosts.length - 1].id
    }
}

module.exports = { getExplore }