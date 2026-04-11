const prisma = require('../config/db');

class interactionService{
    async likePhoto(userID,photoID){
        const photo = await prisma.photos.findUnique({where: {id: photoID}});
        if(!photo) throw new Error("Tấm ảnh này không tồn tại!");

        return await prisma.photos.upsert({
            where: {
                user_id_photo_id: {
                    user_id: userID,
                    photo_ID: photoID,
                },
            },
            update: {},
            create: {
                user_id: userID,
                photoID: photoID,
            },
        });
    }

    async unlikePhoto(userID,photoID){
        return await prisma.photos.delete({
            where: {
                user_id_photo_id:{
                    user_id: userID,
                    photo_ID: photoID,
                },
            },
        });
    }
}

module.exports = new interactionService();