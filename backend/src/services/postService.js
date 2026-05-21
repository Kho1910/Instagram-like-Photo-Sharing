const prisma = require('../config/db')
const cloudinary = require('../config/cloudnary')
const notificationService = require('./notificationService')


const createPost = async (userId, postData) => {
    const user = await prisma.users.findFirst({ where: { id: userId } })
    if (!user) {
        throw new Error('Không tồn tại user.')
    }

    const existedMediaCount = await prisma.medias.count({
        where: {
            id: { in: postData.mediaIds || [] },
            user_id: userId,
            post_id: null // Tránh 1 media thuộc cùng nhiều post
        }
    });

    if (existedMediaCount !== postData.mediaIds.length) {
        throw new Error('Danh sách media không hợp lệ');
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
        throw new Error('Tạo post thất bại.');
    }

    try {
        await notificationService.notifyFollowersOfNewPost(userId, newPost.id);
    } catch (error) {
        console.error('Không thể gửi thông báo post:', error);
    }

    return {
        newPost
    }
}

const deletePost = async (userId, postId) => {
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
        throw new Error('Không thấy post cần xóa.');
    }

    const publicIds = post.medias.map((m) => m.public_id);
    try {
        // Xóa ảnh trên cloudinary
        await cloudinary.api.delete_resources(publicIds, {
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



const getComments = async (postId, lastId) => {
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

    if (comments.length === 0) return [];

    return {
        comments,
        lastId: comments[comments.length - 1].id
    }
}

const likePost = async (userId, postId) => {
    const post = await prisma.posts.findUnique({
        where: { id: postId }
    });

    if (!post) {
        throw new Error('Không tìm thấy bài đăng.');
    }

    return await prisma.likes.upsert({
        where: {
            user_id_post_id: {
                user_id: userId,
                post_id: postId
            }
        },
        update: {},
        create: {
            user_id: userId,
            post_id: postId
        }
    });
}

const unlikePost = async (userId, postId) => {
    // use deleteMany to avoid throwing if the like doesn't exist
    const res = await prisma.likes.deleteMany({
        where: { user_id: userId, post_id: postId }
    })
    return res // { count: number }
}

const getPost = async (userId, postId) => {
    const post = await prisma.posts.findUnique({
        where: { id: postId },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    full_name: true,
                    avatar_url: true
                }
            },
            medias: {
                select: {
                    id: true,
                    public_id: true,
                    resource_type: true
                }
            },
            _count: {
                select: {
                    likes: true,
                    comments: true,
                    views: true
                }
            }
        }
    });

    if (!post) {
        throw new Error('Không tìm thấy bài đăng.');
    }

    const liked = !!(await prisma.likes.findUnique({
        where: {
            user_id_post_id: {
                user_id: userId,
                post_id: postId
            }
        }
    }));

    const isFollowing = post.user_id !== userId && !!(await prisma.follows.findUnique({
        where: {
            follower_id_following_id: {
                follower_id: userId,
                following_id: post.user_id
            }
        }
    }));

    return {
        ...post,
        is_liked: liked,
        is_following: isFollowing,
        like_count: post._count?.likes ?? 0,
        comment_count: post._count?.comments ?? 0,
        view_count: post._count?.views ?? 0,
    };
};

const createComment = async (userId, postId, commentData) => {
    const post = await prisma.posts.findUnique({
        where: { id: postId }
    });

    if (!post) {
        throw new Error('Không tìm thấy bài đăng.');
    }

    const newComment = await prisma.comments.create({
        data: {
            user_id: userId,
            post_id: postId,
            content: commentData.content
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    full_name: true,
                    avatar_url: true
                }
            }
        }
    });

    if (post.user_id !== userId) {
        try {
            const notification = await notificationService.createNotification(post.user_id, userId, 'comment', postId, newComment.id);
            await notificationService.queueNotification({
                type: 'comment',
                recipientID: post.user_id,
                senderID: userId,
                postID: postId,
                commentID: newComment.id,
                notification
            });
        } catch (notificationError) {
            console.error('Không thể gửi thông báo bình luận:', notificationError);
        }
    }

    return newComment;
}

const deleteComment = async (userId, postId, commentId) => {
    const comment = await prisma.comments.findUnique({
        where: { id: commentId }
    });

    if (!comment || comment.post_id !== postId) {
        throw new Error('Không tìm thấy bình luận.');
    }

    if (comment.user_id !== userId) {
        throw new Error('Không có quyền xóa bình luận này.');
    }

    await prisma.comments.delete({
        where: { id: commentId }
    });

    return { success: true };
}

const viewPost = async (userId, postId) => {
    const viewService = require('./viewService');

    const view = await viewService.recordView(userId, postId);

    return {
        success: true,
        view
    }
}

module.exports = { createPost, deletePost, getComments, viewPost, likePost, unlikePost, createComment, deleteComment }