const Conversation=require('../models/conversation')
const Message=require('../models/message')
const User=require('../models/user');
const {onlineUsers}=require('../socket');
const {validateToken}=require('../services/auth');
async function InitialChatLoader(req,res){
    const chats=await Conversation.find({
        participants:req.user._id,
        conversationType:"dm"
    }).populate("participants","_id name email profileImage lastseen").sort({updatedAt:-1})
    const unreadMap={};
    const userId=req.user._id.toString();
    for(const chat of chats){
        const lastseenId=chat.lastSeenMessage?.get(userId);
        const count=await Message.countDocuments({
            conversationId:chat._id,
            ...(lastseenId && {_id: {$gt:lastseenId}})
        });
        console.log(userId+" "+count);
        unreadMap[chat._id.toString()]=count;
    }
    const formatted=chats.flatMap(chat=>{
        return chat.participants
            .filter(p=>p._id.toString()!==userId)
            .map(p=>{
                const otherId=p._id.toString();
                return {
                    id:otherId,
                    name:p.name,
                    email:p.email,
                    profileImage:p.profileImage,
                    lastseen:p.lastseen,
                    youBlocked:chat.blocked.get(userId)===true,
                    blockedYou:chat.blocked.get(otherId)===true,
                    conversationId:chat._id
                }
            })
    })
    const chat2=await Conversation.find({
        participants:req.user._id
    }).sort({updatedAt:-1})
    const conversation= await Promise.all(
    chat2.map(async (chat) => {
    const messages = await Message.find({ conversationId: chat._id })
      .sort({ createdAt: -1 })
      .limit(1);
  
    let lastMessageStatus=false;
    const lastSenderId=messages[0].senderId;
    if(chat.conversationType==="dm"){
        const lastMessageId = messages.length ? messages[0]._id : null;
        const id=chat.participants.find(id=>id!=userId);
        const lastId = chat.lastSeenMessage?.get(id);
        lastMessageStatus=lastId && lastMessageId && lastId.toString() === lastMessageId.toString();
    }
    const lastMessage=await Message.findOne({
        conversationId:chat._id,
        deleteBy: { $nin: [userId] }
    }).sort({createdAt:-1});
    
    return {
      conversationId: chat._id,
      participants: chat.participants,
      lastMessage:lastMessage?.deletedForEveryOne?"This message was deleted":lastMessage?.message,
      lastMessageId:lastMessage?._id,
      lastMessageTime: lastMessage?.createdAt??null,
      lastMessageStatus:lastMessage?.lastMessageStatus,
      lastSenderId:lastMessage?.lastSenderId,
      unreadCount: unreadMap[chat._id.toString()] || 0,
      deletedUntil: chat.deletedUntil?.get(userId),
      conversationType: chat.conversationType,
      groupName: chat.groupName,
      groupProfilePhoto: chat.groupProfilePhoto,
      groupEmail: chat.groupEmail,
    };
  })
);
    console.log(unreadMap);
    res.status(200).json({
        formatted:formatted,
        conversation:conversation
    });
}
async function searchHandler(req,res){
    const {email}=req.body;
    console.log(email);
    const user=await User.findOne({email:email})
    if(user && user.email!==req.email){
        res.status(200).json({
            name:user.name,
            profileImage:user.profileImage,
            id:user._id
        })
    }else{
        res.status(404).json({message:'user not found'})
    }

}
async function newChatHandler(req,res){
    const {id}=req.body;
    const user=await User.findOne({_id:id});
    res.status(200).json({
        name:user.name,
        profileImage:user.profileImage,
    })
}
async function messageHandler(req,res){
    const convId=req.params.conversationId
    let messages=await Message.find({conversationId:convId}).sort({ createdAt: 1 });
    const conversation=await Conversation.findById(convId);
    const lastSeenMessage=conversation?.lastSeenMessage;
    const { id, type } = req.query;
    if(messages.length!=0 && type=="dm"){
        const lastId=lastSeenMessage.get(id);
        messages=messages.map((msg)=>({
            ...msg.toObject(),
            status: lastId && msg._id.toString() <= lastId.toString()
        }))
    }
    res.status(200).json({
        messages:messages
    })
    
}
async function statusHandler(req,res){
    const userId=req.params.id;
   return res.status(200).json({
        status: onlineUsers.has(userId)
    });
}
async function newFriendHandler(req,res) {
    const userId=req.params.id;
    const user=await User.findOne({_id:userId});
    return res.status(200).json({
        name:user.name,
        email:user.email,
        profileImage:user.profileImage
    })
}
async function notificationHandler(req,res){
    const userId=req.params.id;
   const chats=await Conversation.find({
        participants:req.user._id,    
    })
    let sum=0;
    for(const chat of chats){
        const lastseenId=chat.lastSeenMessage?.get(userId);
        const count=await Message.countDocuments({
            conversationId:chat._id,
            ...(lastseenId && {_id: {$gt:lastseenId}})
        });
        sum+=count;
    }
    res.status(200).json({
        notificationCount:sum
    })
}
async function deleteMessageForMeHandler(req,res){
    const { selectedMessagesDeletion } = req.body;
     const token=req.cookies?.token;
    const data=validateToken(token);
    const userId=data._id
    console.log(userId);
     for (const id of selectedMessagesDeletion){
         console.log("deleteMessageForMeHandler "+id);
        await Message.findOneAndUpdate(
            {_id:id},
            {
                $push: { deleteBy: userId } 
            }
            
        )
    }
    return res.status(200).json({
        success: true
    });
}
module.exports={
    InitialChatLoader,
    searchHandler,
    newChatHandler,
    messageHandler,
    statusHandler,
    newFriendHandler,
    notificationHandler,
    deleteMessageForMeHandler
}
