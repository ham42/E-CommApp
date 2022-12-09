const mongoose = require('mongoose');

const dbConnection = () => {

    mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true})
        .then((data) => {
            console.log(`Mongodb Server Connected with ${data.connection.host}`);
        })
}

module.exports = dbConnection