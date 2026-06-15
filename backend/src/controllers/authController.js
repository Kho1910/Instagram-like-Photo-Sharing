const authService = require('../services/authService');

const register = async(req,res)=> {
    try{
        const user = await authService.register(req.body);

        res.status(201).json({message: "Đăng kí thành công!",user});

    }

    catch(exception){
        res.status(400).json({
            message: "Đăng kí thất bại",
            error: exception.message
        });
    }
}

const login = async(req,res)=> {
    try{
        const {email,password} = req.body;
        const result = await authService.login(email,password);

        res.status(200).json(
            {message: "Đăng nhập thành công!",
             token: result.token,   
             user: {id: result.user.id, email: result.user.email}
            });
    }
    catch(exception){
        res.status(401).json({
            message: "Đăng nhập thất bại",
            error: exception.message
        });
    }
}

const forgotPassword = async(req,res)=> {
    try{
        await authService.forgotPassword(req.body.email);
        res.json({message: "Mã OTP đã được gửi!"});
    }
    catch(exception){
        res.status(400).json({message: "Lỗi đã xảy ra!",error: exception.message});
    }
}

const resetPassword = async(req,res)=> {
    try{
        const {email,otp,newPassword} = req.body;
        await authService.resetPassword(email,otp,newPassword);

        res.json({message: "Password đã được thay đổi!"});
    }
    catch(exception){
        res.status(400).json({message: "Lỗi đã xảy ra!", error: exception.message});
    }
}

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
};

