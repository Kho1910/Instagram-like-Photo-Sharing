const prisma = require('../config/db')
const cloudinary = require('../config/cloudnary')

const createPost = async ( userId, postData ) => {
    const user = await prisma.users.findFirst({ where: { id: userId }})
    if(!user) {
        throw new Error ('Không tồn tại user.')
    }

    const existedMediaCount = await prisma.medias.count({
        where: {
            id: { in: postData.mediaIds || [] },
            user_id: userId,
            post_id: null
        }
    });

    if (existedMediaCount !== (postData.mediaIds || []).length) {
        throw new Error ('Danh sách media không hợp lệ');
    }

    const newPost = await prisma.$transaction(async (tx) => {
        const post = await tx.posts.create({
            data: {
                title: postData.title,
                content: postData.content,
                user_id: userId,
            }
        });

        if (postData.mediaIds && postData.mediaIds.length > 0) {
            await tx.medias.updateMany({
                where: {
                    id: { in: postData.mediaIds },
                },
                data: {
                    post_id: post.id
                }
            });
        }

        return await tx.posts.findUnique({
            where: { id: post.id },
            include: { medias: true, user: true }
        });
    });

    if (!newPost) {
        throw new Error ('Tạo post thất bại.');
    }

    return {
        newPost
    }
}

const deletePost = async ( userId, postId ) => {
    const post = await prisma.posts.findFirst({
        where: {
            id: postId,
            user_id: userId
        },
        include: {
            medias: { select: { public_id: true } }
        }
    })

    if (!post) {
        throw new Error ('Không thấy post cần xóa.');
    }

    const publicIds = post.medias.map((m) => m.public_id);
    try {
        await cloudinary.api.delete_resources( publicIds, {
            invalidate: true
        })

        await prisma.$transaction([
            prisma.posts.delete({ where: { id: postId } })
        ])

        return { success: true }

    } catch (error) {
        throw error;
    }    
}

const getFeed = async () => {
    const feed = await prisma.posts.findMany({
        orderBy: { created_at: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatar_url: true
                }
            },
            medias: {
                select: {
                    public_id: true
                }
            }
        }
    })

    return feed.map(post => ({
        ...post,
        imageUrl: post.medias?.[0]?.public_id ? cloudinary.url(post.medias[0].public_id, { secure: true }) : null
    }))
}

module.exports = { createPost, deletePost, getFeed };
