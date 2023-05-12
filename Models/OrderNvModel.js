import mongoose from 'mongoose';

const productReviewSchema = mongoose.Schema(
    {
        userName: { type: String, required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true },
    },
    {
        timestamps: true,
    },
);

const orderSchema = mongoose.Schema(
    {
        userKh: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        userNv: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        orderItems: [
            {
                name: { type: String, required: true },
                color: { type: String, required: true },
                qty: { type: Number, required: true },
                image: { type: String, required: true },
                price: { type: Number, required: true },
                productReview: [productReviewSchema],
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product',
                },
            },
        ],
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: false },
            country: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
            default: 'Payment in cash',
        },
        paymentResult: {
            id: { type: String },
            status: { type: String },
            update_time: { type: String },
            email_address: { type: String },
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        discountPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        errorPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        errorPaidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
        receive: {
            type: Boolean,
            required: true,
            default: false,
        },

        receiveAt: {
            type: Date,
        },
        phone: {
            type: String,
            require: true,
        },
        name: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true,
        },
        content: { type: String },
        idOrder: { type: String, require: true },
    },
    {
        timestamps: true,
    },
);

const OrderNv = mongoose.model('OrderNv', orderSchema);

export default OrderNv;
