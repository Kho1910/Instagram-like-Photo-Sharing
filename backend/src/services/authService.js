const prisma = require('../config/db');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { error } = require('console');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

class authService{
    async register(data){
        const hashPassword = await argon2.hash(data.password);
        return await prisma.users.create({
            data:{
                email: data.email,
                username: data.username,
                password_hash: hashPassword,
                full_name: data.full_name
            }
        });
    }

    async login(email,password){
        const user = await prisma.users.findUnique({where: {email }}); //tim kiem user trong db theo email

        if(!user || !(await argon2.verify(user.password_hash, password))){
            throw new Error("Thông tin nhập không chính xác!");
        }

        const token = jwt.sign(
            {id: user.id, email: user.email },
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        ); //tao token de giup user dang nhap nhanh sau do (thoi han cua token la 1d)

        return {user,token};
    }

    async forgotPassword(email){

        const user = await prisma.users.findUnique({ where: { email } });

        if(!user){
            throw new Error("Email này chưa tồn tại!");
        }
        const otp = crypto.randomInt(100000,999999).toString();

        const expires = new Date(Date.now() + 10*60*1000 );

        await prisma.users.update({
            where: {email},
            data: {otp_code: otp,otp_expires_at: expires}
        });
        await transporter.sendMail({
            to: email,
            subject: "Mã xác thực OTP - instagram",
            text: "Mã otp của bạn là " + otp + ". Mã sẽ hết hạn trong 10 phút!"
        });
    }

    async resetPassword(email,otp,newPassword){
        const user = await prisma.users.findUnique({where: {email}});

        if(!user || user.otp_code != otp || new Date() > user.otp_expires_at){
            throw new Error("Mã OTP của bạn không hợp lệ hoặc hết hạn!");
        }

        const hashPassword = await argon2.hash(newPassword);

        
        return await prisma.users.update({
            where: {email},
            data:{
                password_hash: hashPassword,
                otp_code: null,
                otp_expires_at: null
            }
        });
    }
}

module.exports = new authService(); //có thể dùng ngay ở file khác mà không cần tạo (có thể gọi đến các chức năng trực tiếp)



