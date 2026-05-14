const userService = require('../services/userService')

const getProfile = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const profile = await userService.getProfile(userId);

        return res.status(200).json({
            profile: profile
        })
    } catch (error) {
        res.status(400).json({
            message: 'Lấy profile thất bại',
            error: error.message
        })
    }
}

const follow = async (req, res) => {
    try {
        const followerId = parseInt(req.user.id);
        const followingId = parseInt(req.params.id);
        await userService.follow(followerId, followingId);

        return res.status(204);
    } catch (error) {
        res.status(400).json({
            message: 'Follow thất bại',
            error: error.message
        })
    }
}

const unfollow = async (req, res) => {
    try {
        const followerId = parseInt(req.user.id);
        const followingId = parseInt(req.params.id);
        await userService.unfollow(followerId, followingId);

        return res.status(204);
    } catch (error) {
        res.status(400).json({
            message: 'Unfollow thất bại',
            error: error.message
        })
    }
}

const getUserPosts = async (req, res) => {
	try {
		const userId = parseInt(req.params.id);
		const limit = parseInt(req.params.limit) || 10;
		const cursorId = req.query.cursorId ? parseInt(req.query.cursorId) : null;

		const result = await userService.getUserPosts(userId, limit, cursorId);

		return res.status(200).json({
			message: 'Lấy các bài đăng thành công',
			data: result
		});
	} catch (error) {
		return res.status(400).json({
			message: 'Lấy các bài đăng thất bại', error: error.message,
		});
	}
}

const getAvatarUploadSignature = async (req, res) => {
	try {
		const userId = parseInt(req.params.id);
		const signature = await mediaService.getSignature(userId);

		const avatarSignature = {
			...signature,
			folder: `instar/users/${userId}/avatar`,
		};

		return res.status(200).json({
			message: 'Lấy signature thành công',
			data: avatarSignature,
		});
	} catch (error) {
		return res.status(400).json({
			message: 'Lấy signature thất bại',
			error: error.message,
		});
	}
}

const updateAvatar = async (req, res) => {
	try {
		const userId = parseInt(req.user.id);
		const { publicId } = req.body;

		if (!publicId) {
			return res.status(400).json({
				message: 'publicId không được để trống'
			});
		}

		await mediaService.confirmMedia(userId, publicId, 'image');

		const updatedUser = await userService.updateProfile(userId, {
			avatar_url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`
		});

		return res.status(200).json({
			message: 'Cập nhật avatar thành công',
			profile: updatedUser,
		});
	} catch (error) {
		return res.status(400).json({
			message: 'Cập nhật avatar thất bại',
			error: error.message,
		});
	}
}

const updateProfile = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const updatedProfile = await userService.updateProfile(userId, req.body);

        return res.status(200).json({
            message: 'Cập nhật profile thành công',
            profile: updatedProfile,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Cập nhật profile thất bại',
            error: error.message,
        });
    }
}

module.exports = {
    getProfile,
    follow,
    unfollow,
    getUserPosts,
    getAvatarUploadSignature,
    updateAvatar,
    updateProfile,
}

