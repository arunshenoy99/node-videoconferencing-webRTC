const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const path = require('path')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

var sockets = []

io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    sockets.push(socket.id)
    socket.on('call-user', (data, callback) => {
        if (!sockets.includes(data.to)) {
            return callback('Please enter a valid socket')
        }
        socket.to(data.to).emit('call-made', {
            offer: data.offer,
            socket: socket.id
        })
    })

    socket.on('make-answer', (data) => {
        socket.to(data.to).emit('answer-made', {
            socket: socket.id,
            answer: data.answer
        })
    })
})

server.listen(3000, () => {
    console.log('Server is up on port ' + 3000)
})