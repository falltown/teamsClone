const express = require('express')
const http = require('http')
const app = express()
const server = http.Server(app)
const { Server } = require('socket.io')
const io= new Server(server)

var names = [] 

app.set('view engine', 'ejs');



app.get('/:room',(req,res)=>{
    res.render('room.ejs',{ id: req.params.room })
})

app.use(express.static('public'))

io.on('connection', (socket) => {
    socket.on('name',(name)=>{
        names.push(name)
        io.emit('onlineusers',names)
    })

    socket.on('call',(msg)=>{
        io.emit('called',msg)
    })

    socket.on('disconnect',()=>{
        names=[]
        io.emit('refresh-names')
        
    })
    
    socket.on('new-participant',(msg)=>{
        console.log(msg)
        socket.join(msg.roomId)
        socket.broadcast.to(msg.roomId).emit('new-peer', msg.peerId)
    })
})

const PORT = process.env.PORT || 5000

server.listen(PORT,()=>{
    console.log(`listening to ${PORT}`)
})