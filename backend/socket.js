const cookie = require('cookie');
const User=require('./models/user');
const Message=require('./models/message');
const Conversation=require('./models/conversation')
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
        console.log(socket.userId+" came online ")
        socket.join(socket.userId)
        console.log(socket.id);//this creates a room of socket ids for this id
        socket.broadcast.emit('userOnline',{
           userId:socket.userId
        })
        onlineUsers.add(socket.userId);
        onlineUsers.forEach((user)=>{
            
        })
        socket.on('disconnect',async()=>{
            console.log(socket.userId+" gone offline ");
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
        socket.on('sendMessage',async(data)=>{
            console.log(data.message);
            let conversationId=data.conversationId
            console.log("conversationId "+conversationId);
            console.log("Server socket id:", socket.id);
            if(!data.conversationId){
                const conversation=await Conversation.create({
                    participants:[data.senderId,data.receiverId[0]],
                    lastMessage:data.message,
                    lastMessageTime:new Date().toISOString(),
                    conversationType:data.conversationType
                })
                conversationId=conversation._id
                console.log("Emitting conversationId to", socket.id);
                io.to(socket.userId).emit("conversationId", {
                    conversationId,
                    message: data.message,
                    receiverId: data.receiverId
                });
            }
            else{
                await Conversation.findByIdAndUpdate(
                        conversationId,
                        {   
                            lastMessage: data.message,
                            lastMessageTime: new Date().toISOString(),
                        }
                );
            }
            const message=await Message.create({
                    conversationId:conversationId,
                    senderId:data.senderId,
                    receiverId:data.receiverId,
                    message:data.message,
                    messageType:data.messageType
            })
           for (const id of data.receiverId) {
                console.log("frejkfjk");
                console.log(id);
                io.to(id).emit('receiveMessage',{
                    conversationId:conversationId,
                    senderId:data.senderId,
                    receiverId:id,
                    message:data.message,
                    messageId:message._id,
                    messageType:data.messageType
                })
            }

            // await Conversation.findByIdAndUpdate(
            //             conversationId,
            //             {   
            //                  $set: {
            //                     [`lastSeenMessage.${socket.userId}`]: message._id
            //                 }
            //             }
            //     );
            
            

        })
        socket.on('messageReceived',async(data)=>{
            console.log("message Recieved");
            await Conversation.findByIdAndUpdate(
                        data.conversationId,
                        {   
                             $set: {
                                [`lastSeenMessage.${socket.userId}`]: data.messageId
                            }
                        }
                );
                console.log(data.participants);
                data.participants.forEach((id)=>{
                    io.to(id).emit('messageReceived',{
                        conversationId:data.conversationId
                    })
                })
                
        })
        // socket.on('userTyping',(data)=>{
        //     io.to(data.to).emit('userTyping',{
        //         from:socket.userEmail
        //     })
        // })
        // socket.on('userNotTyping',(data)=>{
        //     io.to(data.to).emit('userNotTyping',{
        //         from:socket.userEmail
        //     })
        // })
        // socket.on('youBlocked',(data)=>{
        //     io.to(data.to).emit('youGotBlocked',{
        //         from:socket.userEmail
        //     })
        // })
        // socket.on('youUnblocked',(data)=>{
        //     io.to(data.to).emit('youGotUnblocked',{
        //         from:socket.userEmail
        //     })
        // })
        socket.on("openedConv",async(data)=>{
        console.log(data.conversationId);
        const conv=await Conversation.findById(data.conversationId);
        const lastMessage=conv.lastMessage
        const message=await Message.findOne({conversationId:data.conversationId,message:lastMessage});
        const lastMessageId=message._id;
        await Conversation.findByIdAndUpdate(
            data.conversationId,
            {
            $set: {
                [`lastSeenMessage.${socket.userId}`]:lastMessageId
            }
            }
        )
        if(data.conversationType==="dm"){
            console.log(data.participants);
            data.participants.forEach(id=>{
            io.to(id).emit('openedConv',{
                conversationId:data.conversationId,
            })
        })
        }
    })
    })
    
}
module.exports={
    initSocket,
    onlineUsers
}