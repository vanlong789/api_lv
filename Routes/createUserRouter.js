import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../Models/UserModel.js';
import { SendMail } from '../utils/nodemailler.js';

const createUserRouter = express.Router();

// nhập thông tin để đăng kí tài khoản
createUserRouter.post(
    '/verified',
    asyncHandler(async (req, res) => {
        const { name, email, phone, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('Tài khoản đã tồn tại');
        }
        const token = jwt.sign({ name, email, phone, password }, process.env.JWT_SECRET, {
            expiresIn: '60m',
        });
        if (token) {
            const url = `https://lvtn-balo-store.vercel.app/verify/register/${email}/${token}`;
            const html = `
        <div style = "margin-left : 23%" >
            <div style = "padding: 20px;
            border: #e1e4e8 solid 1px;
            width: 500px; font-size : 17px">
            <div style = "text-align: center;">
            <img src="https://res.cloudinary.com/dwl3ckysm/image/upload/v1683440613/Logo/logo2_bbfutm.png"
            style ="height: 100px">
            </div>
            <span style = "font-size: 24px; font-weight: 600; margin-left: 29%">Xác thực tài khoản</span>
            <p>Để kích hoạt tài khoản BaloStore của bạn. Vui lòng xác thực tài khoản email của bạn :</p>
            <a href="${url}" target="_blank"  style = "text-decoration: none; margin-left : 27%">
            <button style = "background-color: #4ac4fa;
            padding: 18px 30px;
            border: none;
            border-radius: 8px;
            font-size: 20px">
                Xác thực tài khoản
            </button>
            </a>
            <p style="margin:5px 0">Trân trọng</p>
            <p style="margin:5px 0">BaloStore</p>
            </div>
        </div>`;

            const messageOptions = {
                recipient: email,
                subject: 'Xác thực tài khoản BaloStore',
                html: html,
            };

            //send verify email
            try {
                await SendMail(messageOptions);
                res.status(200);
                res.json('Link xác minh đã gửi qua email, vui lòng kiểm tra hòm thư của bạn');
            } catch (error) {
                res.status(400);
                throw new Error(error);
            }
        }
    }),
);

//xác minh tài khoản qua email
createUserRouter.post(
    '/verified/:token',
    asyncHandler(async (req, res) => {
        const { token } = req.params;
        try {
            const verify = jwt.verify(token, process.env.JWT_SECRET);
            const { name, email, phone, password } = verify;
            const userExists = await User.findOne({ email });
            if (userExists) {
                res.status(400);
                throw new Error('Bạn đã xác nhận email này rồi');
            }
            if (verify) {
                await User.create({
                    name,
                    email,
                    phone,
                    password,
                });
                res.json('Tài khoản đã đăng kí thành công');
            }
        } catch (error) {
            res.status(400);
            throw new Error('Thời gian đã hết hạn hoặc đã xác minh');
        }
    }),
);

export default createUserRouter;
