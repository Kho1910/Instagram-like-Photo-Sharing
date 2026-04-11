const interactionService = require('../services/interactionService');

const likePhoto = async (req,res) => {
    try{
        const photoID = parseInt(req.params.id);
        const userID = req.user.id;

        await interactionService.likePhoto(userID, photoID);
        res.status(201).json({message: "Like thành công!"});
    }
    catch(exception){
        res.status(400).json({message: "Lỗi đã xảy ra!", error: exception.message});
    }
}

const unlikePhoto = async(req,res) => {
    try {
        const photoID = parseInt(req.params.id);
        const userID = req.user.id;

        await interactionService.unlikePhoto(userID,photoID);
        res.json({message: "Đã hủy like!"});
    }
    catch(exception){
        res.status(400).json({message: "Không thể thực hiện", error: exception.message});
    }
}

module.exports = {
  likePhoto,
  unlikePhoto
};