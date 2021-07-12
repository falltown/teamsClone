document.addEventListener('DOMContentLoaded', ()=>{
    //retrieving username from local storage
    var name = localStorage.getItem('username')

    //redirecting to home page in case of no url
    if(localStorage.getItem('token')==null)
    {
        window.location.href = "/"
    }

    var socket = io()

    //emitting name to socket server
    socket.emit("name",name)

    //recieving list of online users and appending it
    socket.on('onlineusers',(msg)=>{
        document.querySelector('#users').innerHTML=''
        for(n in msg)
        {
            const li = document.createElement('li')
            li.innerHTML=msg[n]
            document.querySelector('#users').append(li)
        }
    })

    //updating list of online users
    socket.on('refresh-names',()=>{
        socket.emit("name",name)
    })

    //listening for incoming call requests
    socket.on('called',(msg)=>{
        //checking if username matches with the name of person being called
        if(msg.calleeName==name)
        {
            // creating a button for accepting the call
            let btn = document.createElement('button')
            btn.innerHTML=`Accept incoming call from ${msg.callerName}`
            btn.setAttribute("id","accept")
            btn.setAttribute('class',"btn btn-dark form-control")
            document.querySelector('#incoming-call').appendChild(btn)
            // redirecting to chat room on accepting of call
            document.querySelector('#accept').onclick = () =>{
                window.location.href = `room/${msg.callerName}`
            }
            setTimeout(()=>{window.location.href='/home'},10000)
        }
    })

    //placing a call
    document.querySelector('#calling-form').onsubmit = () =>{
        const callee = document.querySelector('#callee').value;
        
        //emmiting caller and callee names to the socket server
        socket.emit('call',{
            callerName: name,
            calleeName: callee
        })

        //redirecting to chat room
        window.location.href = `/room/${name}`
        return false
    }

    //redirecting to custom room
    document.querySelector('#new-room').onsubmit = () =>{
        const customId = document.querySelector('#room-id').value
        window.location.href = `/room/${customId}`
        return false;
    }
})