const socket = io()

socket.on('connect', () => {
    $localSocketid.innerHTML = `<h5>Your socket id is <b>${socket.id}</b></h5>`
})

const $localVideo = document.querySelector('#local-video')
const $localSocketid = document.querySelector('#local-socket-id')

navigator.mediaDevices.getUserMedia({video: true, audio: true})
.then((stream) => {
    $localVideo.srcObject = stream
})
.catch((error) => {
    console.log(error)
})

