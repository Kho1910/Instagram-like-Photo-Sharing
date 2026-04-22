const Joi = require('joi')

const postSchema = {
    create: Joi.object({
        title: Joi.string()
            .max(50)
            .allow(null),
        content: Joi.string()
            .allow(null),
        mediaIds: Joi.array().items(Joi.number().min(1)).min(1).max(10)        
    })
}

module.exports = postSchema