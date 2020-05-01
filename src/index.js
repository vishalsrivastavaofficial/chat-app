const http = require('http')
const path = require('path')
const express = require('express')
const Filter = require('bad-words')
const { generateLocationMessage, generateMessage } = require('./utils/messages')

const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0

io.on('connection', (socket) => {
    socket.emit('message', generateMessage('Welcome!'))

    socket.broadcast.emit('message', generateMessage('A new user has joined!'))

    socket.on('sendMessage', (msg, callback)=>{
        //socket.emit('message', msg)
        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }
        io.emit('message', generateMessage(msg))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A User has left!'))
    })
})

server.listen(port, ()=> {
    console.log(`Server is up on port : ${port}`)
})