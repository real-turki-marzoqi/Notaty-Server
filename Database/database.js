const mongoose = require('mongoose')
const colors = require('colors')

const dbConnection =()=>{

    mongoose.connect(process.env.DB_URI)
    .then((conn)=>{

        console.log(colors.magenta(`Database Connected: ${conn.connection.host}`))
    })
}

module.exports = dbConnection