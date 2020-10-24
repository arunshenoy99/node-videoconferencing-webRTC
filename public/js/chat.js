const $localVideo = document.querySelector('#local-video')
const $remoteVideo = document.querySelector('#remote-video')
const $localSocketid = document.querySelector('#local-socket-id')
const $formButton = document.querySelector('#remote-form-button')
const $formInput = document.querySelector('#remote-peer')
var isAlreadyCalling = false


//Establish socket connection to server
const socket = io()

//Import webRTC modules
const {RTCPeerConnection, RTCSessionDescription} = window

//Setup STUN(Session Traversal Utilities for NAT) server address and TURN(Traversal Using Relays around NAT) server address
const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
//Create the peer connection
const peerConnection = new RTCPeerConnection(configuration)


//Socket connection established to server
socket.on('connect', () => {
    $localSocketid.innerHTML = `<h5>Your socket id is <b>${socket.id}</b></h5>`
})


//When the user wants to call
$formButton.addEventListener('click', (e) => {
    e.preventDefault()
    const $remoteid = ($formInput.value).trim()
    callUser($remoteid) 
})


//Call the user setup local description of webRTC and create offer(Caller)
async function callUser(socketid) {
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer)) 
    //Call user event to server
    socket.emit('call-user', {
        offer,
        to: socketid
    }, (error) => {
        alert(error)
    })
}

//Handle incoming call from peer(Callee)
socket.on('call-made', async (data) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer))
    //Send the answer to the server
    socket.emit('make-answer', {
        answer,
        to: data.socket
    })
})


//Acknowledge the answer and set remote description(Caller)
socket.on('answer-made', async (data) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
    if(!isAlreadyCalling) {
        callUser(data.socket)
        isAlreadyCalling = true
    }
})

navigator.mediaDevices.getUserMedia({video: true, audio: true})
.then((stream) => {
    $localVideo.srcObject = stream
    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream))
})
.catch((error) => {
    console.log(error)
})

peerConnection.ontrack = function({streams: [stream]}) {
    $remoteVideo.srcObject = stream
}