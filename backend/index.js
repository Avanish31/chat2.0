const express=require('express');
const mongoose=require('mongoose');
const cookie=require('cookie');
const path=require('path');
const cookieParser=require('cookie-parser');
const PORT=8005;
const http=require('http');
const{Server}=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=new Server(server,{
    cors:{
        origin: "http://localhost:5173",
         credentials: true
    }

});


mongoose.connect('mongodb://127.0.0.1:27017/chat2').then((e)=>console.log('MongoDb connected'));

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve('./public')));


const userRoute=require('./routes/user');
const chatRoute=require('./routes/chat');
const {checkAutherisation}=require('./middlewares/autherisation');
const { validateToken } = require('./services/auth');
const {initSocket}=require('./socket');


initSocket(io,validateToken);
app.use('/api/user',userRoute);
app.use('/api/chat',checkAutherisation,chatRoute);
server.listen(PORT,()=>console.log(`Server connected to ${PORT}`));
