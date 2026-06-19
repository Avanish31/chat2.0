import axios from 'axios'
import {setFriends,setChatMeta,addFriend,setSelectedUserId} from '../../chat/state/chat'

export async function chatAuth(dispatch,navigate){
    try{
    const res=await axios.get('/api/chat');
    console.log('data fetched');
    const data=res.data;
    if(data.length>0){
    const friend=data.map(user=>({  
        id:user.id,
        name:user.name,
        email:user.email,
        profileImage:user.profileImage,
        youBlocked: user.youBlocked,
        blockedYou: user.blockedYou,
        conversationId:user.conversationId
    })
    
    ) 
    console.log(friend)  
    const chatMeta=data.map(user=>({
        id:user.id,
        lastMessage:user.lastMessage,
        lastMessageTime:user.lastMessageTime,
        unreadCount:user.unreadCount,
        deletedUntil:user.deletedUntil
    }))
    dispatch(setFriends(friend));
    dispatch(setChatMeta(chatMeta));
    
    }
    
    }catch(err){
        console.log('error while loading chats');
        navigate('/signin');
    }
}