import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../Models/UserModel.js';
import asyncHandler from 'express-async-handler';
import { SendMail } from '../utils/nodemailler.js';

const forgotPassRouter = express.Router();

// nhập mail, gửi link thay đổi mật khẩu
forgotPassRouter.post(
    '/forgotPassword',
    asyncHandler(async (req, res) => {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404);
            throw new Error('Tài khoản không tồn tại');
        } else {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, {
                expiresIn: '60m',
            });

            user.resetPasswordToken = token;
            const save = await user.save();
            if (save) {
                const url = `https://lvtn-balo-store.vercel.app/updatePass/${email}`;
                const html = `
                 <div style = "margin-left: 22.5%; font-size: 17px">
                    <div style = "width: 514px;
                        padding: 20px;
                        margin: 28px;
                        border: #e1e4e8 solid 1px;
                        border-radius: 8px">
                    <div style = "text-align: center;">
                        <img src="https://res.cloudinary.com/dwl3ckysm/image/upload/v1683440613/Logo/logo2_bbfutm.png"
                        style ="height: 100px">
                    </div>
                    <p style = "margin-left : 33%;
                        font-size: 20px;
                        font-weight: 600;
                        margin:5px 0;
                        text-align: center
                        ">
                    Thiết lập lại mật khẩu
                    </p>
                    <p>Xin chào ${user.name}</p>
                    <p>Chúng tôi nhận được yêu cầu thiết lập lại mật khẩu cho tài khoản BaloStore của bạn. Vui lòng sử dụng nút sau để đặt lại  mật khẩu của bạn </p>
                    <a href="${url}" target="_blank"
                    style = "text-decoration: none; margin-left: 32.5%;">
                    <button style = "background-color: #4ac4fa;
                        padding: 18px 30px;
                        border: none;
                        border-radius: 8px;
                        font-size: 17px">
                        Đặt lại mật khẩu
                    </button>
                    </a>
                    <p>Nếu bạn không sử dụng liên kết này trong vòng 1 giờ, liên kết này sẽ hết hạn.</p>
                    <p style="margin:5px 0">Trân trọng</p>
                    <p style="margin:5px 0">BaloStore</p>
                </div>
            </div>`;

                const messageOptions = {
                    recipient: email,
                    subject: 'Đặt lại mật khẩu',
                    html: html,
                };

                //send verify email
                try {
                    await SendMail(messageOptions);
                    res.status(200);
                    res.json('Link đặt lại mật khẩu đã được gửi qua email, vui lòng kiểm tra hòm thư của bạn');
                } catch (error) {
                    res.status(400);
                    throw new Error(error);
                }
            }
        }
    }),
);

forgotPassRouter.post(
    '/resetPassword/:email',
    asyncHandler(async (req, res) => {
        const { email } = req.params;
        const { password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404);
            throw new Error('Tài khoản này không tồn tại!');
        }
        try {
            const verify = jwt.verify(user.resetPasswordToken, process.env.JWT_SECRET);
            if (verify) {
                user.password = password;
                user.resetPasswordToken = null;
                const save = await user.save();
                if (save) {
                    res.status(200);
                    res.json('Mật khẩu đã được thay đổi');
                }
            }
        } catch (error) {
            res.status(400);
            throw new Error('Thời gian đã hết hạn hoặc bạn đã cập nhật mật khẩu');
        }
    }),
);

export default forgotPassRouter;
