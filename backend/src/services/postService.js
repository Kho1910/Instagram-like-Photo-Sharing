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
            post_id: null // Tránh 1 media thuộc cùng nhiều post
        }
    });

    if (existedMediaCount !== postData.mediaIds.length) {
        throw new Error ('Danh sách media không hợp lệ');
    }

    const newPost = await prisma.$transaction(async (tx) => {
        // Tạo post
        const post = await tx.posts.create({
            data: {
                title: postData.title,
                content: postData.content,
                user_id: userId,
            }
        });

        // Cập nhật các media
        if (postData.mediaIds && postData.mediaIds.length > 0) {
            await tx.medias.updateMany({
                where: {
                    id: { in: postData.mediaIds },
                },
                data: {
                    post_id: post.id // Gán ID vừa tạo
                }
            });
        }

        return await tx.posts.findUnique({
            where: { id: post.id },
            include: { medias: { select: { public_id: true } } }
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
            medias: {
                select: {
                    public_id: true
                }
            }
        }
    })

    if (!post) {
        throw new Error ('Không thấy post cần xóa.');
    }

    const publicIds = post.medias.map((m) => m.public_id);
    try {      
        // Xóa ảnh trên cloudinary
        await cloudinary.api.delete_resources( publicIds, {
            invalidate: true // Xóa ngay lập tức
        })

        // Xóa trong database
        await prisma.$transaction([
            prisma.posts.delete({
                where: {
                    id: postId
                }
            })
        ])

        return { success: true }

    } catch (error) {
        throw error;
    }    
}

const getComments = async ( postId, lastId ) => {
    const LIMIT = 20; // Lấy 20 comment 1 lần
    const comments = await prisma.comments.findMany({
        where: {
            post_id: postId
        },

        orderBy: {
            created_at: 'desc'
        },

        take: LIMIT,

        cursor: lastId ? { id: Number(lastId) } : undefined,

        skip: lastId ? 1 : 0,

        select: {
            id: true,
            content: true,
            created_at: true,
            // Thay vì 'include', hãy dùng 'select' cho quan hệ 'user'
            user: {
                select: {
                    id: true,
                    username: true,
                    full_name: true,
                    avatar_url: true
                }
            }
        }
    })

    if(comments.length === 0) return [];

    return {
        comments,
        lastId: comments[comments.length - 1].id
    }
}

module.exports = { createPost, deletePost, getComments }