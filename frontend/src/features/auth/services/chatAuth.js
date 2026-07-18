import axios from 'axios'
import {setFriends,setChatMeta,setConversations} from '../../chat/state/chat'

export async function chatAuth(dispatch,navigate){
    try{
    const res=await axios.get('/api/chat');
    console.log('data fetched');
    const formatted=res.data.formatted;
    const conversation=res.data.conversation;
    
    if(formatted.length>0){
    console.log(formatted);
    const friend=formatted.map(user=>({  
        id:user.id,
        name:user.name,
        email:user.email,
        profileImage:user.profileImage,
        youBlocked: user.youBlocked,
        blockedYou: user.blockedYou,
        conversationId:user.conversationId
    })
    ) 
     dispatch(setFriends(friend));
    }
    if(conversation.length>0){
    const chatMeta=conversation.map(conv=>({
        id:conv.conversationId,
        lastMessage:conv.lastMessage,
        lastMessageId:conv.lastMessageId,
        lastMessageTime:conv.lastMessageTime,
        unreadCount:conv.unreadCount,
        deletedUntil:conv.deletedUntil,
        lastMessageStatus:conv.lastMessageStatus,
        lastSenderId:conv.lastSenderId,
        isTyping:false
    }))
    
    const conversations=conversation.map(conv=>({
        id:conv.conversationId,
        type:conv.conversationType,
        participants:conv.participants,
        groupName:conv.groupName,
        groupProfilePhoto:conv.groupProfilePhoto,
        groupEmail:conv.groupEmail
    }))
    console.log(chatMeta);
    dispatch(setChatMeta(chatMeta));
    dispatch(setConversations(conversations))
    }
    
    }catch(err){
        console.log(err);
        console.log('error while loading chats');
        navigate('/signin');
    }
}