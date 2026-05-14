const Joi = require('joi');

const commentSchema = {
    create: Joi.object({
        content: Joi.string()
            .trim()
            .min(1)
            .max(500)
            .required()
    })
};

module.exports = commentSchema;
