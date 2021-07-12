// const e = require("express")

const roomId = "<%= id %>"
var socket = io()
var peer = new Peer()
var name = localStorage.getItem('username')
const videostreams ={}
var myvideo
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia

getUserMedia({video: true, audio: true}, (mystream) => {
    myvideo = mystream;
    let video = document.createElement('video')
    video.muted =true
    video.srcObject = mystream
    video.addEventListener('loadedmetadata',  () => {
            video.play()
    })
    document.querySelector('#videos').appendChild(video)

    peer.on('call',(call)=>{
        console.log(call)
        call.answer(mystream)
        let video = document.createElement('video')
        call.on('stream', (remoteStream) => {
            video.srcObject = remoteStream
            video.addEventListener('loadedmetadata',  () => {
                    video.play()
            })
            document.querySelector('#videos').appendChild(video)
        });
        call.on('close',()=>{
            video.remove()
        })
        videostreams[call.peer]=call;
    })

    socket.on('new-peer',(peerId)=>{
        const call = peer.call(peerId, mystream)
        let video = document.createElement('video')
        call.on('stream', (remoteStream) => {
            video.srcObject = remoteStream
            video.addEventListener('loadedmetadata',  () => {
                video.play();
            })
            document.querySelector('#videos').appendChild(video)
        });
        call.on('close',()=>{
            video.remove()
        })
        videostreams[peerId]=call;
    })

}, function(err) {
    console.log('Failed to get local stream' ,err);
});





socket.on('user-hangedup',(peerId)=>{
    console.log(peerId+"disconnected")
    if(videostreams[peerId])
    {
        videostreams[peerId].close();
    }
})





document.addEventListener('DOMContentLoaded', ()=>{
    let form = document.querySelector('#textbox')
    let input = document.querySelector('#input')
    let messages = document.querySelector('#messages')

    form.addEventListener('submit',(f)=>{
        f.preventDefault()
        if(input.value)
        {
            socket.emit('send message',{
                roomId: roomId,
                message: name+": "+input.value
            })
            input.value='';
        }
    })

    socket.on('new-message',(msg)=>{
        console.log(msg)
        let item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
    })
    
})



peer.on('open',(id)=>{
    console.log(id)
    socket.emit('new-participant',{
        roomId: roomId,
        peerId: id
    })
})

const toggleMic = () =>{
    if(myvideo.getAudioTracks()[0].enabled)
    {
        myvideo.getAudioTracks()[0].enabled = false;
        document.querySelector('#micbtn').innerHTML="Unmute"
    }
    else
    {
        myvideo.getAudioTracks()[0].enabled = true;
        document.querySelector('#micbtn').innerHTML="Mute"
    }
}

const toggleCam = () =>{
    if(myvideo.getVideoTracks()[0].enabled)
    {
        myvideo.getVideoTracks()[0].enabled = false;
        document.querySelector('#cambtn').innerHTML="Turn on camera"
    }
    else
    {
        myvideo.getVideoTracks()[0].enabled = true;
        document.querySelector('#cambtn').innerHTML="Turn off camera"
    }
}
        