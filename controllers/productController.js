const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const ApiFeatures = require('../utils/apiFeatures')

// Creating the New Product
exports.createProduct = catchAsyncError(async (req, res, next) => {

    req.body.user = req.user.id
    const product = await Product.create(req.body)

    res.status(201).json({
        success: true,
        product
    })
})


// Getting All the Products
exports.getAllProducts = catchAsyncError(async (req, res) => {
    const productCount = await Product.countDocuments()

    const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(10)

    const products = await apiFeature.query

    res.status(200).json({
        success: true,
        products,
        productCount
    })
})


// Updating the Product
exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler('Product Not Found', 404))
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        product
    })
})


// Deleting the Product
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler('Product Not Found', 404))
    }

    await product.remove()

    res.status(200).json({
        success: true,
        message: 'Product Deleted'
    })
})


// Get Product Details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler('Product Not Found', 404))
    }

    res.status(200).json({
        success: true,
        product
    })
})


// Create new Review or Update Review
exports.createProductReview = catchAsyncError(async (req, res, next) => {

    const {rating, comment, productId} = req.body

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)

    const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id)

    if(isReviewed){
        product.reviews.forEach(rev => {
            if(rev.user.toString() === req.user._id){
                rev.rating = rating,
                rev.comment = comment
            }
        })
    }
    else{
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let avg = 0
    product.ratings = product.reviews.forEach(rev => {
        avg += rev.rating
    })
    product.ratings = avg / product.reviews.length

    await product.save({validateBeforeSave: false})

    res.status(200).json({
        success: true
    })
})



// Get all reviews of a Product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler('Product not Found', 404))
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})


// Delete review of a Product
exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler('Product not Found', 404))
    }

    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString())

    let avg = 0

    reviews.forEach((rev) => {
        avg += rev.rating
    })

    const ratings = avg / reviews.length
    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews, ratings, numOfReviews
    },
    {
        new: true,
        runValidators: true,
        useFindAndModify: false
    }
    )

    res.status(200).json({
        success: true
    })
})