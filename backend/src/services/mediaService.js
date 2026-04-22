const cloudinary = require('../config/cloudnary')
const prisma = require('../config/db')

const getSignature = async (userId) => {
    const user = await prisma.users.findFirst({ where: { id: userId }})
    if(!user) {
        throw new Error ('Không tồn tại user.')
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `instar/users/${userId}/posts`;

    const paragramToSign = {
        timestamp: timestamp,
        folder: folder,
    }

    const signature = await cloudinary.utils.api_sign_request(
        paragramToSign,
        process.env.CLOUDINARY_API_SECRET
    );

    return {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        timestamp: timestamp,
        folder: folder,
        signature: signature,
    }
}

/**
 * Thêm media vào database
 */
const confirmMedia = async ( userId, publicId, resourceType ) => {
    const user = await prisma.users.findFirst({ where: { id: userId }})
    if(!user) {
        throw new Error ('Không tồn tại user.')
    }

    const newMedia = await prisma.medias.create({
        data: {
            user_id: userId,
            resource_type: resourceType,
            public_id: publicId,
            status: 'done',

        }
    })

    if(!newMedia) {
        throw new Error ('Cập nhật dữ liệu thất bại.')
    }

    return {
        mediaId: newMedia.id
    }
}

module.exports = { getSignature, confirmMedia }