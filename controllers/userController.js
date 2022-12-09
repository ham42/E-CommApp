const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchAsyncError')
const User = require('../models/userModel')
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')


// Register a User
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const {name, email, password} = req.body

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id : "This is the Sample Id",
            url: "ProfilePicUrl"
        },
    })

    sendToken(user, 201, res)
})


// Login User
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const {email, password} = req.body

    if(!email || !password){
        return next(new ErrorHandler('Please Enter Email & Password', 400))
    }

    const user = await User.findOne({email}).select('+password')
    if(!user){
        return next(new ErrorHandler('Please Enter Valid Email & Password', 400))
    }

    const isPasswordMatched = await user.comparePassword(password)
    if(!isPasswordMatched){
        return next(new ErrorHandler('Please Enter Valid Email & Password', 400))
    }

    sendToken(user, 200, res)
})


// Logout User
exports.logoutUser = catchAsyncError(async(req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'User Successfully Logged Out'
    })
})


// Forgot Password
exports.forgotPassword = catchAsyncError(async(req, res, next) => {
    const user = await User.findOne({email: req.body.email})

    if(!user){
        return next(new ErrorHandler('User not Found', 404))
    }

    const resetToken = user.getResetPasswordToken()
    await user.save({validateBeforeSave: false})

    const resetPasswordUrl = `${req.protocol}://${req.get('host')}/api/password/reset/${resetToken}`
    const message = `Your Password reset Token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it`


    try {
        await sendEmail({
            email: user.email,
            subject: `E-CommApp password recovery`,
            message
        })
        res.status(200).json({success: true, message: `Email Sent to ${user.email} successfully`})
        
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave: false})

        return next(new ErrorHandler(error.message, 500))
    }
})


// Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await user.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler('Reset Password Token is Invalid or has been Expired', 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not Matched', 400))
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendToken(user, 200, res)
})


// User Details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user
    })
})

// Update User password
exports.updateUserPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id)

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword)
    if(!isPasswordMatched){
        return next(new ErrorHandler('Old password is Incorrect', 400))
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not Match', 400))
    }

    user.password = req.body.newPassword

    await user.save()

    sendToken(user, 200, res)

})


// Update User Profile
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserDate, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })

})


// Get all Users (admin)
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        success: true,
        users
    })
})


// Get user details (admin)
exports.getUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler('User does not exist with the given id', 400))
    }

    res.status(200).json({
        success: true,
        user
    })
})


// Update User Role (admin)
exports.updateUserRole = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserDate, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })

})


// Delete User (admin)
exports.deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler('User does not exist', 400))
    }

    await user.remove()

    res.status(200).json({
        success: true,
        message: 'User deleted Successfully'
    })

})