const cookie = require('cookie');
function initSocket(io, validateToken){
    io.use((socket,next)=>{
        const rawCookie=socket.handshake.headers.cookie;
        console.log(rawCookie);
        const cookies=cookie.parse(rawCookie);
        const token=cookies.token;
        socket.userEmail=validateToken(token).email;
        socket.userId=validateToken(token)._id;
        socket.name=validateToken(token).name;
        next();
    })
    const onlineUsers=new Set();
    io.on('connection',(socket)=>{
        socket.join(socket.userId)//this creates a room of socket ids for this id
        socket.broadcast.emit('userOnline',{
           userId:socket.userId
        })
        onlineUsers.add(socket.userId);
        socket.emit('currentlyOnline',Array.from(onlineUsers));
        socket.on('disconnect',async()=>{
            const room=io.sockets.adapter.rooms.get(socket.userId);
            if(!room || room.size===0){
            onlineUsers.delete(socket.userId);
            socket.broadcast.emit('userOffline',{
                userId:socket.userId
            })
           
            
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
}