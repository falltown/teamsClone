const roomId = "<%= id %>"
var socket = io()

//creating a new peer
var peer = new Peer()

//retrieving username from local storage
var name = localStorage.getItem('username')

//list to store ongoing calls
const videostreams ={}

var myvideo

//geting camera and microphone stream
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia

getUserMedia({video: true, audio: true}, (mystream) => {
    myvideo = mystream;


    //adding user video to videos
    let video = document.createElement('video')
    video.muted =true
    video.srcObject = mystream
    video.addEventListener('loadedmetadata',  () => {
            video.play()
    })
    document.querySelector('#videos').appendChild(video)

    //recieving incoming calls
    peer.on('call',(call)=>{
        console.log(call)

        //sending user stream as answer to call
        call.answer(mystream)

        //adding stream from the call to videos
        let video = document.createElement('video')
        call.on('stream', (remoteStream) => {
            video.srcObject = remoteStream
            video.addEventListener('loadedmetadata',  () => {
                    video.play()
            })
            document.querySelector('#videos').appendChild(video)
        });

        //removing video element from videos in case of disconnection
        call.on('close',()=>{
            video.remove()
        })

        //adding call to the list of ongoing calls
        videostreams[call.peer]=call;
    })

    //listening to server for new peers
    socket.on('new-peer',(peerId)=>{
        //calling new peer
        const call = peer.call(peerId, mystream)

        //adding peer's stream to videos
        let video = document.createElement('video')
        call.on('stream', (remoteStream) => {
            video.srcObject = remoteStream
            video.addEventListener('loadedmetadata',  () => {
                video.play();
            })
            document.querySelector('#videos').appendChild(video)
        });

        //removing video element from videos in case of disconnection
        call.on('close',()=>{
            video.remove()
        })

        //adding call to list of ongoing calls
        videostreams[peerId]=call;
    })

}, function(err) {
    //throwing error in case of failure in getting userstream
    console.log('Failed to get local stream' ,err);
});




//listening to server for disconnected peers
socket.on('user-hangedup',(peerId)=>{
    console.log(peerId+"disconnected")
    //closing the call with disconnected peer
    if(videostreams[peerId])
    {
        videostreams[peerId].close();
    }
})





document.addEventListener('DOMContentLoaded', ()=>{
    let form = document.querySelector('#textbox')
    let input = document.querySelector('#input')
    let messages = document.querySelector('#messages')

    //sending message from textbox to the server
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

    //listening to socket server for new chat messages
    socket.on('new-message',(msg)=>{
        console.log(msg)

        //appending new message to list of messages
        let item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
    })
    
})

//sending peerid and roomid to socket server on creation of new peer
peer.on('open',(id)=>{
    console.log(id)
    socket.emit('new-participant',{
        roomId: roomId,
        peerId: id
    })
})

//function to toggle mic on and off
const toggleMic = () =>{
    //if statement to check current state of microphone
    if(myvideo.getAudioTracks()[0].enabled)
    {
        //turning off microphone
        myvideo.getAudioTracks()[0].enabled = false;
        document.querySelector('#micbtn').innerHTML="Unmute"
    }
    else
    {
        //turning on microphone
        myvideo.getAudioTracks()[0].enabled = true;
        document.querySelector('#micbtn').innerHTML="Mute"
    }
}

//function to toggle camera on and off
const toggleCam = () =>{
    //if statement to check the current state of camera
    if(myvideo.getVideoTracks()[0].enabled)
    {
        //turning off camera
        myvideo.getVideoTracks()[0].enabled = false;
        document.querySelector('#cambtn').innerHTML="Turn on camera"
    }
    else
    {
        //turning on camera
        myvideo.getVideoTracks()[0].enabled = true;
        document.querySelector('#cambtn').innerHTML="Turn off camera"
    }
}
        