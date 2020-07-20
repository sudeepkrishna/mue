const express = require('express')
const app = express()
const server = require('http').createServer(app)
const path = require('path')
const socketio = require('socket.io')
const chalk = require('chalk')

require('./db/mongoose')
const User = require('./models/userModel')

const { generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')
const { saveMessage, fetchMessages, saveLocationMessage } = require('./utils/chat')

const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
    console.log(chalk.green.inverse('New websocket connection'))

    //listener event when a new client connects
    socket.on('join', async ({ username, room }, callback) => {
        const {error, user} = await addUser({username, room, socketid: socket.id})

        if(error){
            return callback(error)
        }
        //joins a chat room
        socket.join(user.room)

        //fetch existing messages
        const fetchedMessages = await fetchMessages( user.room, user._id )

        socket.emit('startup', {room: user.room, name: user.name})
        //render the fetched messages
        fetchedMessages.forEach(m => {
            if(m.location === true){
                socket.emit('location', { url: m.message, username: m.sender, createdAt: m.createdAt })
            }
            else{
                socket.emit('message', { text: m.message, username: m.sender, createdAt: m.createdAt })
            }
        })

        //issue welcome message to the joined user
        socket.emit('chat-app', `Welcome, ${user.name}!`)
        //socket.emit('set-user-name', user.name)
        //notify other users that a new user has joined
        socket.broadcast.to(user.room).emit('chat-app', `${user.name} has joined!`)

        //update users in sidebar
        const users = await getUsersInRoom(user.room)
        io.to(user.room).emit('usersInRoom',{
            users: users,
        })
        callback()
    })

    socket.on('sendMessage', async (msg, callback) => {
        //fetch user to know which room to send message to
        const user = await getUser(socket.id)

        //send message - invokes client listener
        io.to(user.room).emit('message', generateMessage(user.name, msg))
        
        callback(msg)

        //save message to db
        saveMessage({room: user.room, message: msg, sender: user.name})
    })

    socket.on('disconnect', async () => {
        try{
            const user = await getUser(socket.id)
            if(user){
                io.to(user.room).emit('chat-app', `${user.name} has disconnected!`)
            }  
        }
        catch(e){
            console.log(e)
        }
    })

    socket.on('leave-room', async(roomname, callback) => {
        socket.leave(roomname, async () => {
            const user = await removeUser(socket.id)
            if (user) {
                //update users in sidebar
                const users = await getUsersInRoom(user.room)
                io.to(user.room).emit('chat-app', `${user.name} has left!`)
                io.to(user.room).emit('usersInRoom', {
                    users: users,
                })
            }
            callback()
        })
    })

    socket.on('sendLocation', async (coords, callback) => {
        //fetch user to know which room to send message to
        const user = await getUser(socket.id)

        const msg = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`

        //send location message - invokes client listener
        io.to(user.room).emit('location', generateLocationMessage(user.name, msg))

        callback()
        //save location message to db
        saveLocationMessage({ room: user.room, message: msg, sender: user.name, location: true })
    })
})

server.listen(port, () => {
    console.log('Server is listening on port ' + port)
})