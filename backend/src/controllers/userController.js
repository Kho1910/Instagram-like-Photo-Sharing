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
        const followerId = req.user.id;
        const followingId = req.params.id;
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
        const followerId = req.user.id;
        const followingId = req.params.id;
        await userService.unfollow(followerId, followingId);

        return res.status(204);
    } catch (error) {
        res.status(400).json({
            message: 'Unfollow thất bại',
            error: error.message
        })
    }
}

module.exports = {
    getProfile,
    follow,
    unfollow
}