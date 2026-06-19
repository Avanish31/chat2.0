const cookie = require('cookie');
const User=require('./models/user');
let onlineUsers=new Set();
function initSocket(io, validateToken){
    io.use((socket,next)=>{
        const rawCookie=socket.handshake.headers.cookie;
        const cookies=cookie.parse(rawCookie);
        const token=cookies.token;
        socket.userEmail=validateToken(token).email;
        socket.userId=validateToken(token)._id;
        socket.name=validateToken(token).name;
        next();
    })
    
    io.on('connection',(socket)=>{
        socket.join(socket.userId)//this creates a room of socket ids for this id
        socket.broadcast.emit('userOnline',{
           userId:socket.userId
        })
        onlineUsers.add(socket.userId);
        onlineUsers.forEach((user)=>{
            
        })
        socket.on('disconnect',async()=>{
            
            const room=io.sockets.adapter.rooms.get(socket.userId);
            if(!room || room.size===0){
            onlineUsers.delete(socket.userId);
            const now = new Date();
            const lastseen= now.toLocaleDateString()+" on "+now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            socket.broadcast.emit('userOffline',{
                userId:socket.userId,
                lastseen:lastseen
            })
            await User.findByIdAndUpdate(
                socket.userId,
                { lastseen:lastseen }
            );
        }
        
        })
        socket.on('userTyping',(data)=>{
            io.to(data.to).emit('userTyping',{
                from:socket.userEmail
            })
        })
        socket.on('userNotTyping',(data)=>{
            io.to(data.to).emit('userNotTyping',{
                from:socket.userEmail
            })
        })
        socket.on('youBlocked',(data)=>{
            io.to(data.to).emit('youGotBlocked',{
                from:socket.userEmail
            })
        })
        socket.on('youUnblocked',(data)=>{
            io.to(data.to).emit('youGotUnblocked',{
                from:socket.userEmail
            })
        })
        
    })
}
module.exports={
    initSocket,
    onlineUsers
}