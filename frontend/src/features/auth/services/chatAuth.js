import axios from 'axios'
import {setFriends,setChatMeta,addFriend,setSelectedUserId} from '../../chat/state/chat'
export async function chatAuth(navigate,dispatch){
    
    try{
    const res=await axios.get('/api/chat');
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
    navigate('/chat');
    }catch(err){
        navigate('/signin');
    }
}