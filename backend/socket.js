const cookie = require('cookie');
const User=require('./models/user');
const Message=require('./models/message');
const Conversation=require('./models/conversation');
const Media = require('./models/media');
const storageService=require('./services/storage/index');
const {activeDownloads}=require('./services/localDownload')
const localDownloader=require('./services/localDownload');
const {removeByUserId}=require('./services/uploadQueue');
let onlineUsers=new Set();
const crypto = require("crypto");
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
            removeByUserId(socket.userId);
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
            
            let conversationId=data.conversationId
            console.log("conversationId "+conversationId);
            console.log("Server socket id:", socket.id);
            let message=null;
            if(!data.conversationId && data.messageType!=="media"){
                const conversation=await Conversation.create({
                    participants:[data.senderId,data.receiverId[0]],
                    lastMessageTime:new Date().toISOString(),
                    conversationType:data.conversationType,
                    visibility:[data.senderId,data.receiverId[0]]
                })
                conversationId=conversation._id
                message=await Message.create({
                    conversationId:conversationId,
                    senderId:data.senderId,
                    receiverId:data.receiverId,
                    message:data.message,
                    messageType:data.messageType,
                    sendTime:data.messageTime,
                    receiveTime:data.messageTime,
                    dummy:data.dummy,
                    visibility:conversation.participants
                 })
                console.log("Emitting conversationId to", socket.id);
                io.to(socket.userId).emit("conversationId", {
                    conversationId,
                    message: data.message,
                    messageId:message._id,
                    receiverId: data.receiverId
                });
            }
            else{
                if(!data.dummy){
                await Conversation.findByIdAndUpdate(
                        conversationId,
                        {
                            lastMessageTime: new Date().toISOString(),
                        }
                );
            }
            }
            if(!message){
            if(data.messageType!="media"){
            const conv=await Conversation.findOne({_id:conversationId});
             message=await Message.create({
                    conversationId:conversationId,
                    senderId:data.senderId,
                    receiverId:data.receiverId,
                    message:data.message,
                    messageType:data.messageType,
                    sendTime:data.messageTime,
                    receiveTime:data.messageTime,
                    dummy:data.dummy,
                    visibility:conv.participants
            })
            }
            else{
                const conv=await Conversation.findOne({_id:conversationId});
                conv.visibility = conv.participants;
                await conv.save();
                const tempMessage=await Message.findOneAndUpdate(
                    {senderId:data.senderId,message:data.message},
                    {
                        visibility:conv.participants,
                        receiveTime:data.messageTime,
                        
                    },
                    { new: true ,
                    timestamps: false
                    }
                )
                message=tempMessage;

            }
            }
            if(!data.dummy){
            await Conversation.findByIdAndUpdate(
                        conversationId,
                        {   
                             $set: {
                                [`lastSeenMessage.${socket.userId}`]: message._id
                            }
                        }
            );
            }
            if(data.messageType!="media"){
            socket.emit('messageSaved',{
                tempId:data.tempId,
                messageId:message._id,
                convId:conversationId
            })
        }
            if(!data.blocked){
                console.log("blocked status "+data.blocked);
                for (const id of data.receiverId) {
                        console.log("frejkfjk");
                        console.log(id);
                        io.to(id).emit('receiveMessage',{
                            conversationId:conversationId,
                            senderId:data.senderId,
                            receiverId:id,
                            message:data.message,
                            messageId:message._id,
                            messageType:data.messageType,
                            messageTime:data.messageTime
                        })
                        
                    }
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
                const conversation=await Conversation.findById(data.conversationId);
                data.participants.forEach((id)=>{
                    const intervals=conversation.blocked.filter(b=>b.blockedBy.equals(socket.userId) && b.blockedUser.equals(id));
                    io.to(id).emit('messageReceived',{
                        conversationId:data.conversationId,
                        intervals:intervals
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
        
        console.log(data.conversationId+" openedconv");
        const message=await Message.findOne({conversationId:data.conversationId}).sort({createdAt:-1});
        const lastMessageId=message._id;
        const conversation=await Conversation.findById(data.conversationId);
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
            const intervals=conversation.blocked.filter(b=>b.blockedBy.equals(socket.userId) && b.blockedUser.equals(id));
            intervals.forEach(itn=>{
                console.log("gojo "+itn);
            })
            io.to(id).emit('openedConv',{
                conversationId:data.conversationId,
                intervals:intervals
            })
        })
        }
    })


    socket.on('userTyping',async(data)=>{
        console.log(data.participants);
        data.participants.forEach(id=>{
        io.to(id).emit('userTyping',{
            userId:data.userId,
            conversationId:data.conversationId
        })
        })
    })

    socket.on('userNotTyping',async(data)=>{
        console.log(data.participants);
        data.participants.forEach(id=>{
        io.to(id).emit('userNotTyping',{
            userId:data.userId,
            conversationId:data.conversationId
        })
        })
    })

    socket.on('deleteMessageForEveryOne',async(data)=>{
        console.log("hulean alvarej")
        console.log("gama sraega "+data.selectedMessagesDeletion)
        for(const id of data.selectedMessagesDeletion){
            console.log("yesaaah")
            await Message.findOneAndUpdate(
                {_id:id},
                {$set:{deletedForEveryOne:true}},
            )
        }
        data.participants.forEach(id=>{
            io.to(id).emit('deleteMessageForEveryOne',{
                conversationId:data.conversationId,
                selectedMessagesDeletion:data.selectedMessagesDeletion
            })
        })
    })
    socket.on('blocked',async(data)=>{
        io.to(data.blockedId).emit('blocked',{
            userId:socket.userId
        })
        await Conversation.findByIdAndUpdate(
            data.conversationId,
            {
                $push:{
                    blocked:{
                        blockedBy:socket.userId,
                        blockedUser:data.blockedId
                    }
                }
            }
        )
    })
    socket.on('unblocked',async(data)=>{
        console.log("unblockeddddd");
        io.to(data.blockedId).emit('unblocked',{
            userId:socket.userId
        })
        await Conversation.updateOne(
            {
            _id:data.conversationId,
            blocked:{
                $elemMatch:{
                    blockedBy:socket.userId,
                    blockedUser:data.blockedId,
                    unblockedAt:null
                }
            }
            },
            {
                $set:{
                    "blocked.$.unblockedAt": new Date()
                }
            }
        )
    })

   
    socket.on('downloadMedia',async(data)=>{
        const res=await Media.findOne({mediaId:data.mediaId});
        const access = await storageService.getAccessInfo(res.storageKey);
        if (access.method === "stream") {
            await localDownloader.downloadFile({
                mediaId:data.mediaId,
                filePath: access.filePath,
                socket,
                startByte:data.startByte,
                endByte:data.endByte,
            });
        }
    })
    socket.on("media:cancel", async({ mediaId }) => {
        const controller = activeDownloads.get(mediaId);
    console.log("CANCEL mediaId:", mediaId);
    console.log("ACTIVE KEYS:", [...activeDownloads.keys()]);
        console.log("CONTROLLER HITTT ",controller )
        console.log("MediaCancel hitt");
        if (!controller) return;
        controller.abort();
    });
    socket.on('preSaveMediaMessages',async(data,callback)=>{
         let conversationId=data.conversationId
         let conversation;
         console.log('CONVERSATION ID',conversationId);
         let message =null;
        if(!conversationId){
            conversation = await Conversation.findOne({
                participants: {
                    $all: [data.senderId, data.receiverId[0]]
                }
            });
            if(!conversation){
            conversation=await Conversation.create({
                    participants:[data.senderId,data.receiverId[0]],
                    lastMessageTime:new Date().toISOString(),
                    conversationType:data.conversationType,
                    visibility:[data.senderId]
                })
            }   
            conversationId=conversation._id
            message=await Message.create({
                    conversationId:conversationId,
                    senderId:data.senderId,
                    receiverId:data.receiverId,
                    message:data.message,
                    messageType:data.messageType,
                    sendTime:data.messageTime,
                    dummy:data.dummy,
                    visibility:[data.senderId]
            })
                io.to(socket.userId).emit("conversationId", {
                    conversationId,
                    message: data.message,
                    messageId:message._id,
                    receiverId: data.receiverId
                });
        }
        if(!message){
             message=await Message.create({
                    conversationId:conversationId,
                    senderId:data.senderId,
                    receiverId:data.receiverId,
                    message:data.message,
                    messageType:data.messageType,
                    sendTime:data.messageTime,
                    dummy:data.dummy,
                    visibility:[data.senderId]
            })
        }
        console.log("TEMP ",data.tempId," ",message._id);
        callback({
            success: true
        });
        socket.emit('messageSaved',{
                tempId:data.tempId,
                messageId:message._id,
                convId:conversationId
        })


    })
})

   
    
}
module.exports={
    initSocket,
    onlineUsers
}