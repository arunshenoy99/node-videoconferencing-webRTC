const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const path = require('path')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

//Keep track of active sockets
var sockets = []

//Handle a socket connection
io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    sockets.push(socket.id)

    //Handle call user event from caller
    socket.on('call-user', (data, callback) => {
        if (!sockets.includes(data.to)) {
            return callback('Please enter a valid socket')
        }
        //Emit call made event to callee with offer
        socket.to(data.to).emit('call-made', {
            offer: data.offer,
            socket: socket.id
        })
    })

    //Handle make answer event from callee
    socket.on('make-answer', (data) => {
        //emit answer made event to caller with answer
        socket.to(data.to).emit('answer-made', {
            socket: socket.id,
            answer: data.answer
        })
    })
})

server.listen(3000, () => {
    console.log('Server is up on port ' + 3000)
})