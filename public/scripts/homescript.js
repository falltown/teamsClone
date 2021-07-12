document.addEventListener('DOMContentLoaded', ()=>{
    var name = localStorage.getItem('username')
    if(localStorage.getItem('token')==null)
    {
        window.location.href = "/"
    }
    var socket = io()
    socket.emit("name",name)
    socket.on('onlineusers',(msg)=>{
        document.querySelector('#users').innerHTML=''
        for(n in msg)
        {
            const li = document.createElement('li')
            li.innerHTML=msg[n]
            document.querySelector('#users').append(li)
        }
    })
    socket.on('refresh-names',()=>{
        socket.emit("name",name)
    })
    socket.on('called',(msg)=>{
        if(msg.calleeName==name)
        {
            let btn = document.createElement('button')
            btn.innerHTML=`Accept incoming call from ${msg.callerName}`
            btn.setAttribute("id","accept")
            btn.setAttribute('class',"btn btn-dark form-control")
            // document.body.appendChild(btn)
            document.querySelector('#incoming-call').appendChild(btn)
            
            document.querySelector('#accept').onclick = () =>{
                window.location.href = `room/${msg.callerName}`
            }
        }
    })
    document.querySelector('#calling-form').onsubmit = () =>{
        const callee = document.querySelector('#callee').value;
        
        socket.emit('call',{
            callerName: name,
            calleeName: callee
        })

        window.location.href = `/room/${name}`
        return false
    }
    document.querySelector('#new-room').onsubmit = () =>{
        const customId = document.querySelector('#room-id').value

        window.location.href = `/room/${customId}`
        return false;
    }
})