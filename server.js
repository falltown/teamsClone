const express = require('express')
const mongoose = require('mongoose');
const User = require('./models/user');
const http = require('http')
const app = express()
const server = http.Server(app)
const { Server } = require('socket.io')
const io= new Server(server)
const jwt = require('jsonwebtoken');
const { disconnect } = require('process');
const JWT_SECRET = 'wenwajfkwiblebakjubwdfbwaugbuwb'

var names = [] 


mongoose.connect('mongodb+srv://node-rest:node-rest@node-rest-shop.nxem7.mongodb.net/authapp?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.set('view engine', 'ejs');

app.post('/api/register',(req,res)=>{
    console.log(req.body)
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    user.save()
    .then(result=>{
        console.log("user created");
            res.json({
            status: 'ok'
        })
    })
    .catch(err=>{
        console.log("error");
        res.status(500).json({
            error: err
        })
    })
})

app.post('/api/login',(req,res)=>{
    console.log(req.body)
    User.find({username: req.body.username})
    .select('username password')
    .exec()
    .then(docs =>{
        if(docs.length==0)
        {
            console.log("invalid username")
            return res.json({
                status: "error",
                error: "invalid username"
            })
        }
        else if(docs[0].password === req.body.password)
        {
            console.log("authenticated") 
            const token = jwt.sign({ id: docs[0]._id, username: docs[0].username },JWT_SECRET)
            return res.json({
                status: 'ok',
                data: token,
                username: docs[0].username
            })
        }
        else
        {
            console.log("incorrect password")
            return res.json({
                status: "error",
                error: "incorrect password"
            })
        }
    })
    .catch(err => {
        console.log("error");
    })
})






app.get('/home',(req,res)=>{
    res.render('home.ejs')
})


app.get('/room/:roommid',(req,res)=>{
    res.render('room.ejs',{ id: req.params.roomid })
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
        socket.on('disconnect',()=>{
            console.log(msg.peerId+" disconnected")
            socket.broadcast.to(msg.roomId).emit('user-hangedup', msg.peerId);
        })
    })

    socket.on('send message',(msg)=>{
        console.log(msg)
        // socket.join(msg.roomId)
        io.to(msg.roomId).emit('new-message', msg.message)
    })
})

const PORT = process.env.PORT || 5000

server.listen(PORT,()=>{
    console.log(`listening to ${PORT}`)
})