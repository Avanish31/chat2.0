const Conversation=require('../models/conversation')
const Message=require('../models/message')
const User=require('../models/user');
const {onlineUsers}=require('../socket');
async function InitialChatLoader(req,res){
    const chats=await Conversation.find({
        participants:req.user._id
    }).populate("participants","_id name email profileImage lastseen").sort({updatedAt:-1})
    const unreadMap={};
    const userId=req.user._id.toString();
    for(const chat of chats){
        const lastseenId=chat.lastSeenMessage?.get(userId);
        const count=await Message.countDocuments({
            conversationId:chat._id,
            ...(lastseenId && {_id: {$gt:lastseenId}})
        });
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
    const conversation=chat2.map(chat=>{
        return {
            conversationId:chat._id,
            participants:chat.participants,
            lastMessage:chat.lastMessage,
            lastMessageTime:chat.lastMessageTime,
            unreadCount:unreadMap[chat._id.toString()]||0,
            deletedUntil:chat.deletedUntil?.get(userId),
            conversationType:chat.conversationType,
            groupName:chat?.groupName,
            groupProfilePhoto:chat?.groupProfilePhoto,
            groupEmail:chat?.groupEmail
        }
    })
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
    const messages=await Message.find({conversationId:convId}).sort({ createdAt: 1 });
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

module.exports={
    InitialChatLoader,
    searchHandler,
    newChatHandler,
    messageHandler,
    statusHandler,
    newFriendHandler,
}
