const ErrorHandler = require('../utils/errorHandler')

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || 'Internal Server Error'

    // Invalid Id Error
    if (err.name === 'CastError') {
        const message = `Resource not Found. Invalid ${err.path}`
        err = new ErrorHandler(message, 400)
    }

    // Duplicate key Error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(message, 400)
    }

    // Invalid JWT
    if(err.name === 'JsonWebTokenError'){
        const message = `Json Web Token is Invalid, try again`
        err = new ErrorHandler(message, 400)
    }

    // JWT Expiration
    if(err.name === 'TokenExpiredError'){
        const message = `Json Web Token is Expired, try again`
        err = new ErrorHandler(message, 400)
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}