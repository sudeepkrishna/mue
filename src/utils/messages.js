const generateMessage = (username, text) => {
    return {
        text: text,
        username: username,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, locationUrl) => {
    return{
        url: locationUrl,
        username: username,
        createdAt: new Date().getTime()
    }
}
module.exports = { generateMessage, generateLocationMessage}