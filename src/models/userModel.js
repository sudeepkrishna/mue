const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    room: {
        type: String,
        required: true,
        trim: true
    },
    socketid: {
        type: String
    }
}, {
    timestamps: true
})

// //CREATE A MODEL
const User = mongoose.model('User', userSchema)

module.exports = User