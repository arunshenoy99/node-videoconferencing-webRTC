const $localVideo = document.querySelector('#local-video')
const $remoteVideo = document.querySelector('#remote-video')
const $localSocketid = document.querySelector('#local-socket-id')
const $formButton = document.querySelector('#remote-form-button')
const $formInput = document.querySelector('#remote-peer')
var isAlreadyCalling = false

const socket = io()
const {RTCPeerConnection, RTCSessionDescription} = window

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
const peerConnection = new RTCPeerConnection(configuration)

socket.on('connect', () => {
    $localSocketid.innerHTML = `<h5>Your socket id is <b>${socket.id}</b></h5>`
})

navigator.mediaDevices.getUserMedia({video: true, audio: true})
.then((stream) => {
    $localVideo.srcObject = stream
    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream))
})
.catch((error) => {
    console.log(error)
})


$formButton.addEventListener('click', (e) => {
    e.preventDefault()
    const $remoteid = ($formInput.value).trim()
    callUser($remoteid) 
})

async function callUser(socketid) {
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer)) 
    socket.emit('call-user', {
        offer,
        to: socketid
    }, (error) => {
        alert(error)
    })
}

socket.on('call-made', async (data) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer))
    socket.emit('make-answer', {
        answer,
        to: data.socket
    })
})

socket.on('answer-made', async (data) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
    if(!isAlreadyCalling) {
        callUser(data.socket)
        isAlreadyCalling = true
    }
})

peerConnection.ontrack = function({streams: [stream]}) {
    $remoteVideo.srcObject = stream
}