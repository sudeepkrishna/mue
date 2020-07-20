const User = require('../models/userModel')
const mongoose = require('mongoose')
const chalk = require('chalk')

const addUser = async (user) => {
    try {
        const u = await User.findOne({ name: user.username, room: user.room })
        if (u) {
            u.socketid = user.socketid
            await u.save()
            return {
                user: u
            }
        }
        else {
            const userDoc = new User({ name: user.username, room: user.room, socketid: user.socketid })
            await userDoc.save()
            return {
                user: userDoc
            }
        }
    }
    catch (e) {
        console.log(e)
    }
}

const getUser = async (id) => {
    const user = await User.findOne({socketid: id})
    return user
}

const getUsersInRoom = async (room) => {
    const users = await User.find({ room }).select('name -_id')
    return users
}

const removeUser = async (id) => {
    try {
        const user = await User.findOne({ socketid: id })
        if (!user) {
            return console.log(chalk.red('user with id '+ id + ' doesnt exist'))
        }
        else {
            await User.deleteOne({ socketid: id })
            return user
        }
    }
    catch (e) {
        console.log(e)
    }
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}