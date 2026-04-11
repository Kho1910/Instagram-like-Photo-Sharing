const validate = (schema) => (req, res, next) => {
    // Chạy kiểm tra dữ liệu trong body
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
        // Nếu có lỗi, chặn ngay tại đây, không cho vào Controller
        return res.status(400).json({
            message: "Dữ liệu gửi lên không đúng định dạng!",
            details: error.details.map(err => err.message)
        });
    }
    next();
};

module.exports = validate;
