const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const ApiFeatures = require('../utils/apiFeatures')


// create new order
exports.createNewOrder = catchAsyncError(async (req, res, next) => {
    const {shippingInfo, orderItems, paymentInfo, itemsPrice, taxprice, shippingPrice, totalPrice} = req.body;

    const order = await Order.create({shippingInfo, orderItems, paymentInfo, itemsPrice, taxprice, shippingPrice, totalPrice, paidAt: Date.now(), user: req.user._id});

    res.status(201).json({
        success: true,
        order
    })
})


// Get my orders
exports.getMyOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({user: req.user.id});

    if(!orders){
        return next(new ErrorHandler('Orders not Found', 404))
    }

    res.status(200).json({
        success: true,
        orders
    })
})


// Get an order
exports.getOrder = catchAsyncError(async (req, res, next) => {
    const orders = await Order.findById(req.params.id).populate('user', 'name email');

    if(!orders){
        return next(new ErrorHandler('Orders not Found with the given Id', 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})


// Get all orders -- Admin
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})



// Update Order -- Admin
exports.updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler('Order not found with the given Id'), 404)
    }

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler('Order is already delivered', 400));
    }

    order.orderItems.forEach(async (order) => {
        await updateStock(order.product, order.quantity);
    });

    order.status = req.body.status;

    if(order.body.status === "Delivered"){
        order.deliveredAt = Date.now();
    }

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})


async function updateStock(productId, quantity){
    const product = await Product.findById(productId);

    product.Stock -= quantity;

    await product.save({validateBeforeSave: false})
}



// Delete Order
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler('Order not found with the given Id'), 404)
    }

    await order.remove()

    res.status(200).json({
        success: true
    })
})