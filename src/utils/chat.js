const mongoose = require('mongoose')
const Chat = require('../models/chatModel')
const User = require('../models/userModel')


const saveMessage = async ({room, message, sender}) => {
    try{
        const chat = new Chat({ room, message, sender })
        await chat.save()
    }
    catch(e) {
        console.log(e)
    }
}

const saveLocationMessage = async({ room, message, sender, location}) => {
    try {
        const chat = new Chat({ room, message, sender, location })
        await chat.save()
    }
    catch (e) {
        console.log(e)
    }
}

const fetchMessages = async (room, id) => {
    try{
        const time = await User.findById(mongoose.Types.ObjectId(id)).select({ "createdAt": 1, "_id": 0})
        const messages = await Chat.find({ room: room, createdAt: { $gte: time.createdAt}}).select({"message": 1, "sender": 1, "createdAt": 1, "location": 1, "_id": 0})
        return messages
    }
    catch(e){
        console.log(e)
    }
}

module.exports = { saveMessage, fetchMessages, saveLocationMessage }