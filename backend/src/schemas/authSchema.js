const Joi = require('joi');

const authSchema = {
    register: Joi.object({
        username: Joi.string()
            .alphanum()               // Chỉ cho phép chữ và số 
            .min(3).max(30)           // Giới hạn độ dài để tránh làm tràn DB hoặc UI
            .required()
            .messages({ 'string.min': 'Username phải có ít nhất 3 ký tự' }),

        email: Joi.string()
            .email({ tlds: { allow: false } }) // Kiểm tra định dạng email chuẩn
            .required(),

        password: Joi.string()
            .min(6)                   // Ràng buộc độ dài tối thiểu
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')) 
            .required(),

        full_name: Joi.string()
            .max(100)                 // Tránh gửi chuỗi quá dài 
            .required()
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),

    resetPassword: Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string()
            .length(6)                // OTP bắt buộc phải đúng 6 ký tự
            .pattern(/^[0-9]+$/)      // Chỉ được chứa số
            .required(),
        newPassword: Joi.string().min(6).required()
    })
};

module.exports = authSchema;
