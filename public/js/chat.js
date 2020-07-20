const socket = io()

//DOM Elements
const $messageForm = document.querySelector('#msgform')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')
const $leaveRoomButton = document.querySelector('#leave-room')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const messageTemplateOwn = document.querySelector('#message-template-own').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const locationTemplateOwn = document.querySelector('#location-template-own').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const headerTemplate = document.querySelector('#chat-header-template').innerHTML
const chatAppTemplate = document.querySelector('#chat-app-template').innerHTML
const userNameTemplate = document.querySelector('#user-name-template').innerHTML

//Query String parsing
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true})

const autoscroll = () => {
    //fetching the new message
    const $newMessage = $messages.lastElementChild

    //getting height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

let ownusername = ''
let roomname = ''
//populating page header
socket.on('startup', ({room, name}) => {
    ownusername = name
    roomname = room
    document.getElementById("user-name").innerHTML = name
    const html = Mustache.render(headerTemplate, {
        room: room
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

//chat app announcements
socket.on('chat-app', (message) => {
    const html = Mustache.render(chatAppTemplate, {
        message: message
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

//Message Event Listener
socket.on('message', (message) => {
    if (message.username === ownusername) {
        const html = Mustache.render(messageTemplateOwn, {
            message: message.text,
            username: message.username,
            createdAt: moment(message.createdAt).format('h:mm A')
        })
        $messages.insertAdjacentHTML('beforeend', html)
        autoscroll()
    }
    else{
        const html = Mustache.render(messageTemplate, {
            message: message.text,
            username: message.username,
            createdAt: moment(message.createdAt).format('h:mm A')
        })
        $messages.insertAdjacentHTML('beforeend', html)
        autoscroll()
    }
})

//Location Event Listener
socket.on('location', (location) => {
    if(location.username === ownusername) {
        const html = Mustache.render(locationTemplateOwn, {
            location: location.url,
            username: location.username,
            createdAt: moment(location.createdAt).format('h:mm A')
        })
        $messages.insertAdjacentHTML('beforeend', html)
        autoscroll()
    }
    else {
        const html = Mustache.render(locationTemplate, {
            location: location.url,
            username: location.username,
            createdAt: moment(location.createdAt).format('h:mm A')
        })
        $messages.insertAdjacentHTML('beforeend', html)
        autoscroll()
    }
})

socket.on('usersInRoom', ({room, users, owner}) => {
    const html = Mustache.render(sidebarTemplate, {
        users,
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //disabling send button
    const textbar = e.target.elements.textbar.value
    if(textbar !== ''){
        $messageFormButton.setAttribute('disabled', 'disabled')
        socket.emit('sendMessage', textbar, (message) => {
            $messageFormButton.removeAttribute('disabled')
            $messageFormInput.value = ''
            $messageFormInput.focus()
            console.log('The message was delivered ' + message)
        })
    } 
})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert("Location sharing not supported by your browser!")
    }
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled')
            console.log('Location was shared!') //event acknowledgement
        })
    })

})

$leaveRoomButton.addEventListener('click', () => {
    const function1 = function () {
        location.href = "/"
    }
    socket.emit('leave-room', roomname, function1)
})

document.querySelector('#room-back').addEventListener('click', () => {
    location.href = "/"
})

//Send an event to server when a user joins
socket.emit('join', {username, room}, (error) => {
    if(error){
        console.log(error)
        alert(error)
        location.href = "/"
    }
        
})