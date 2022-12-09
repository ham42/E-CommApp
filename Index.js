const express = require('express');
const dotenv = require('dotenv').config()
const dbConnection = require('./config/dbconfig')
const cookieParser = require('cookie-parser')

const product = require('./routes/productRoute')
const user = require('./routes/userRoute')
const order = require('./routes/orderRoute')

const errorMiddleware = require('./middleware/error')

const app = express()
app.use(express.json())
app.use(cookieParser())


// Handling Uncaught Exception
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`)
    console.log('Shutting down the Server due to Uncaught Exception')
    process.exit(1)
})

// Configuring PORT
const PORT = process.env.PORT

// Database Connection
dbConnection()


// Configuring Routes
app.use('/api', user)
app.use('/api', product)
app.use('/api', order)


// Using Error Middleware
app.use(errorMiddleware)


app.listen(PORT, () => {
    console.log(`Server is Running on Port: ${PORT}`)
})

// Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`)
    console.log('Shutting down the Server due Unhandled Promise Rejection')

    app.listen().close(() => {
        process.exit(1)
    })
})