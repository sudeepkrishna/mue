const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatSchema = new Schema({
    room: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    sender: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: Boolean,
        trim: true
    }
},{
    timestamps: true
})

const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat