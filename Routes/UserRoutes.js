import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { protect, admin } from '../Middleware/AuthMiddleware.js';
import generateToken from '../utils/generateToken.js';
import User from './../Models/UserModel.js';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import discount from '../Models/Discount.js';

const __dirname = path.resolve();
const userRouter = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/userProfile');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

// LOGIN
userRouter.post(
    '/login',
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user?.disabled) {
            res.status(400);
            throw new Error('Tài khoản đã bạn đã bị khóa, vui lòng liên hệ shop để có thể lấy lại');
        }
        if (user && (await user.matchPassword(password))) {
            if (!user.isNv) {
                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id),
                    createdAt: user.createdAt,
                    address: user.address,
                    city: user.city,
                    country: user.country,
                    image: user.image,
                    disabled: user.disabled,
                });
            } else {
                res.status(401);
                throw new Error('Tài khoản bạn không phải là khách hàng');
            }
        } else {
            res.status(401);
            throw new Error('Tài khoản hoặc mật khẩu không chính xác');
        }
    }),
);

// LOGIN ADMIN
userRouter.post(
    '/loginAdmin',
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user?.disabled) {
            res.status(400);
            throw new Error('Tài khoản đã bạn đã bị khóa, vui lòng liên hệ shop để có thể lấy lại');
        }
        if (user && (await user.matchPassword(password))) {
            if (user.isAdmin) {
                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id),
                    createdAt: user.createdAt,
                    address: user.address,
                    city: user.city,
                    country: user.country,
                    image: user.image,
                    disabled: user.disabled,
                });
            } else {
                res.status(401);
                throw new Error('Tài khoản bạn không phải quản trị viên');
            }
        } else {
            res.status(401);
            throw new Error('Tài khoản hoặc mật khẩu không chính xác');
        }
    }),
);

// LOGIN NHAN VIEN
userRouter.post(
    '/loginNv',
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user?.disabled) {
            res.status(400);
            throw new Error('Tài khoản đã bạn đã bị khóa, vui lòng liên hệ shop để có thể lấy lại');
        }
        if (user && (await user.matchPassword(password))) {
            if (user.isNv) {
                res.json({
                    _id: user._id,
                    name: user.name,
                    sex: user.sex,
                    email: user.email,
                    date: user.date,
                    phone: user.phone,
                    cmnd: user.cmnd,
                    isAdmin: user.isAdmin,
                    isNv: user.isNv,
                    token: generateToken(user._id),
                    createdAt: user.createdAt,
                    homeTown: user.homeTown,
                    address: user.address,
                    city: user.city,
                    country: user.country,
                    image: user.image,
                    disabled: user.disabled,
                });
            } else {
                res.status(401);
                throw new Error('Tài khoản bạn không phải nhân viên');
            }
        } else {
            res.status(401);
            throw new Error('Tài khoản hoặc mật khẩu không chính xác');
        }
    }),
);

// REGISTER
userRouter.post(
    '/',
    asyncHandler(async (req, res) => {
        const { name, email, phone, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin,
                address: user.address,
                city: user.city,
                country: user.country,
                image: user.image,
                disabled: user.disabled,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid User Data');
        }
    }),
);

// REGISTER
userRouter.post(
    '/nhanvien',
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { name, date, sex, phone, cmnd, email, country, city, homeTown, address, password, image } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('Tài khoản đã tồn tại');
        }

        const user = await User.create({
            name,
            date,
            sex,
            phone,
            cmnd,
            email,
            homeTown,
            country,
            city,
            address,
            password,
            image,
            isNv: true,
        });

        if (user) {
            res.status(201).json('Tạo tại khoản thành công');
        } else {
            res.status(400);
            throw new Error('Invalid User Data');
        }
    }),
);

// GET USER
userRouter.get(
    '/:id/user',
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                sex: user.sex,
                email: user.email,
                date: user.date,
                phone: user.phone,
                cmnd: user.cmnd,
                isAdmin: user.isAdmin,
                isNv: user.isNv,
                homeTown: user.homeTown,
                createdAt: user.createdAt,
                address: user.address,
                city: user.city,
                country: user.country,
                image: user.image,
                disabled: user.disabled,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    }),
);

// PROFILE
userRouter.get(
    '/user',
    protect,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    }),
);

// UPDATE PROFILE KHACH HANG
userRouter.put(
    '/profile',
    protect,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (user?.disabled) {
            res.status(400);
            throw new Error('account lock up');
        }
        if (req.body.image && req.body.image !== user.image) {
            if (user.image) {
                fs.unlink(path.join(__dirname, 'public/userProfile', user.image), (err) => {
                    if (err) console.log('Delete old avatar have err:', err);
                });
            }
        }
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.city = req.body.city || user.city;
            user.country = req.body.country || user.country;
            //user.image = newImage === undefined ? user.image : newImage;
            user.image = req.body.image || user.image;

            if (req.body.password) {
                if (await user.matchPassword(req.body.oldPassword)) {
                    user.password = req.body.password;
                } else {
                    res.status(404);
                    throw new Error('Old Password is not correct!');
                }
            }
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                isAdmin: updatedUser.isAdmin,
                createdAt: updatedUser.createdAt,
                token: generateToken(updatedUser._id),
                address: user.address,
                city: user.city,
                country: user.country,
                image: user.image,
                disabled: user.disabled,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    }),
);

// UPDATE PROFILE NHAN VIEN
userRouter.put(
    '/updateProfile',
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { name, date, sex, phone, cmnd, email, homeTown, country, city, address, password, image, id } = req.body;
        const user = await User.findById(id);
        if (user?.disabled) {
            res.status(400);
            throw new Error('account lock up');
        }
        if (image && image != user.image) {
            fs.unlink(path.join(__dirname, 'public/userProfile', user.image), (err) => {
                if (err) console.log('Delete old avatar have err:', err);
            });
        }
        if (user) {
            user.name = name || user.name;
            user.date = date || user.date;
            user.sex = sex || user.sex;
            user.email = email || user.email;
            user.phone = phone || user.phone;
            user.cmnd = cmnd || user.cmnd;
            user.homeTown = homeTown || user.homeTown;
            user.address = address || user.address;
            user.city = city || user.city;
            user.country = country || user.country;
            user.image = image || user.image;

            if (password) {
                user.password = password;
            }
            const updatedUser = await user.save();
            res.json('Cập nhật thành công');
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    }),
);

// ADD GIFT
userRouter.put(
    '/addGift',
    protect,
    asyncHandler(async (req, res) => {
        const { id, gift, date, price } = req.body;
        const user = await User.findById(id);
        const findDiscount = await discount.findOne({ nameDiscount: gift });
        if (findDiscount) {
            const checkId = findDiscount.idUser.find((user) => user == id);
            if (findDiscount.countInStock > 0) {
                if (!checkId) {
                    user.gift.push({ gift, date, price });
                    findDiscount.idUser.push(id);
                    const saveDiscount = await findDiscount.save();
                    const save = await user.save();
                    if (save) {
                        res.send(user);
                    }
                } else {
                    res.status(400);
                    throw new Error('Mã này đã được nhận');
                }
            } else {
                res.status(400);
                throw new Error('Số lượng mã này đã hết vui lòng tìm mã khác');
            }
        } else {
            res.status(400);
            throw new Error('Mã này không tồn tại');
        }
    }),
);

// GET ALL USER ADMIN
userRouter.get(
    '/',
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const users = await User.find({});
        res.json(users);
    }),
);

// GET ALL USER
userRouter.get(
    '/all',
    asyncHandler(async (req, res) => {
        let allUser = [];
        const users = await User.find({});
        for (let i = 0; i < users.length; i++) {
            allUser.push({ _id: users[i]._id, image: users[i].image });
        }
        res.json(allUser);
    }),
);

// PUT DISPAD USER
userRouter.put(
    '/:id/disabled',
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { disabled } = req.body;
        const user = await User.findById(req.params.id);
        if (user.isAdmin) {
            res.status(400);
            throw new Error('error');
        }
        if (disabled == user.disabled) {
            if (disabled == true) {
                res.status(400);
                throw new Error(disabled);
            } else {
                res.status(400);
                throw new Error(disabled);
            }
        }
        if (user) {
            user.disabled = disabled;
            const retult = await user.save();
            res.status(201).json(retult);
        }
    }),
);

//SEND TK EMAIL
userRouter.post(
    '/sendEmail',
    protect,
    admin,
    asyncHandler(async (req, res) => {
        const { email } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists && (await userExists.matchPassword(email))) {
            const text = `
            Tài khoản của quý khách
            Tài khoản: ${email}
            Mật khẩu: ${email}
            Quý khách vui lòng đổi mật khẩu sau khi đăng nhập thành công, để đảm bảo tính bảo mật của tài khoản
            `;
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'balostore.owner@gmail.com',
                    pass: 'ytmgtsqgkgtypwle',
                },
            });

            var mailOptions = {
                from: 'balostore.owner@gmail.com',
                to: email,
                subject: 'BaloStore kính chào quý khách, đây là thông tin tài khoản đăng nhập của quý khách',
                text: text,
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            res.json({ status: 'TK đã gửi qua email, vui lòng kiểm tra hòm thư của bạn' });
        } else {
            res.status(400);
            throw new Error('Tài khoản chưa được cấp lại mật khẩu');
        }
    }),
);

export default userRouter;
