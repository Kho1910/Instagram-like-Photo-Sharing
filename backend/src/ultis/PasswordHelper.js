const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const passwordHelper = {
    hash: async (password) => {
        return await argon2.hash(password);
    },

    verify: async (hash, password) => {
        return await argon2.verify(hash, password);
    },

    generateToken: (payload, expiresIn = '1d') => {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    },

    verifyToken: (token) => {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return null;
        }
    }
};

module.exports = passwordHelper;
