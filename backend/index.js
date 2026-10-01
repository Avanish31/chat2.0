const express=require('express');
require("dotenv").config();
const mongoose=require('mongoose');
const cookie=require('cookie');
const path=require('path');
const cookieParser=require('cookie-parser');
const PORT=process.env.PORT;
const http=require('http');
const{Server}=require('socket.io');
const chunkService=require('./services/chunkService');
const app=express();
const server=http.createServer(app);
const {setIO,getIO}=require('./exportHelper');
const io=new Server(server,{
    cors:{
        origin: "http://localhost:5173",
         credentials: true
    }

});

setIO(io);


mongoose.connect(process.env.DB).then((e)=>console.log('MongoDb connected'));

app.use(express.urlencoded({extended:false}));
app.use(express.json({
     limit: "10mb",
    extended: true
}));
app.use(cookieParser());
app.use(express.static(path.resolve('./public')));


const userRoute=require('./routes/user');
const chatRoute=require('./routes/chat');
const {checkAutherisation}=require('./middlewares/autherisation');
const { validateToken } = require('./services/auth');
const {initSocket}=require('./socket');

async function startCleanup() {
    while (true) {
        try {
            await chunkService.cleanupExpiredUploads();
        } catch (err) {
            console.error("Cleanup failed:", err);
        }

        await new Promise(resolve => setTimeout(resolve, 20_000));
    }
}

startCleanup();
initSocket(io,validateToken);
app.use('/api/user',userRoute);
app.use('/api/chat',checkAutherisation,chatRoute);
server.listen(PORT,()=>console.log(`Server connected to ${PORT}`));
module.exports={
    io
}
