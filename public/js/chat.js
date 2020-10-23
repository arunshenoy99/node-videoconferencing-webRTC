const socket = io()

const $localVideo = document.querySelector('#local-video')

navigator.mediaDevices.getUserMedia({video: true, audio: true})
.then((stream) => {
    $localVideo.srcObject = stream
})
.catch((error) => {
    console.log(error)
})