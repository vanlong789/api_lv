import express from 'express';
import asyncHandler from 'express-async-handler';
import { admin, protect } from '../Middleware/AuthMiddleware.js';
import Product from '../Models/ProductModel.js';
import OrderNv from './../Models/OrderNvModel.js';
import Order from './../Models/OrderModel.js';

const orderNvRouter = express.Router();

// CREATE ORDER NHAN VIEN
orderNvRouter.get(
    '/:id/detail',
    protect,
    asyncHandler(async (req, res) => {
        const orderDetail = await OrderNv.findById(req.params.id)
            .populate('userKh', 'id name email')
            .populate('userNv', 'id name email');
        if (orderDetail) {
            res.json(orderDetail);
        } else {
            res.status(404);
            throw new Error('Order Not Found');
        }
    }),
);

// ORDER IS PAID
orderNvRouter.put(
    '/:id/pay',
    protect,
    asyncHandler(async (req, res) => {
        const order = await OrderNv.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404);
            throw new Error('Order Not Found');
        }
    }),
);

// GET ALL ORDER
orderNvRouter.get(
    '/all/orders',
    protect,
    asyncHandler(async (req, res) => {
        const pageSize = 15;
        const page = Number(req.query.pageNumber) || 1;
        const status = Number(req.query.status) || 0;

        let search = {};
        if (req.query.keyword) {
            search.email = {
                $regex: req.query.keyword,
                $options: 'i',
            };
        }
        if (req.user._id) {
            search.userNv = req.user._id;
        }
        if (status == 3) {
            search.isDelivered = true;
            search.isPaid = false;
        }
        if (status == 4) {
            search.isPaid = true;
        }
        if (status == 7) {
            search.errorPaid = true;
        }
        const count = await OrderNv.countDocuments({ ...search });
        let orders = await OrderNv.find({ ...search })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ _id: -1 })
            .populate('userKh', 'id name email')
            .populate('userNv', 'id name email');

        res.json({ orders, page, pages: Math.ceil(count / pageSize) });
    }),
);

export default orderNvRouter;
