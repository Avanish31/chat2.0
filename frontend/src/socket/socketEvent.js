import { getSocket } from "./socketClient";
import { useSelector} from "react-redux";
import { addChatMeta, addFriend, setChatMeta, setRealTimeData ,addMessages} from "../features/chat/state/chat";
import axios from "axios";
export function initSocket(socket,selectedUserId,dispatch,friends){
if(!socket){
    return;
}
console.log('inisde socket');
socket.on('userOnline',async(data)=>{
    if( selectedUserId && data.userId==selectedUserId){
        console.log(data.userId+" came online")
        dispatch(setRealTimeData({
            status:true,
            lastseen:null,
        }))
    }
})

socket.on('userOffline',async(data)=>{
    if(selectedUserId && data.userId==selectedUserId){
        console.log(data.userId+" went offline");
        dispatch(setRealTimeData({
            status:false,
            lastseen:data.lastseen
        }));
    }
})

socket.on('conversationId',async(data)=>{
    if(data.receiverId){
    const res=await axios.get(`/api/chat/newFriendSend/${data.receiverId}`);
    dispatch(addFriend({
        id:data.receiverId,
        name:res.data.name,
        email:res.data.email,
        profileImage:res.data.profileImage,
        youBlocked: null,
        blockedYou: null,
        conversationId:data.conversationId
    }))
    dispatch(addChatMeta({
        id:data.receiverId,
        lastMessage:data.message,
        lastMessageTime:new Date().toISOString(),
        unreadCount:null,
        deletedUntil:null
    }))
    }

})

socket.on('receiveMessage',async(data)=>{
console.log('message recieved');
  const byId=friends.byId;
  const allIds=friends.allIds;
  if(byId[data.senderId]){
    dispatch(addLastMessage({
        lastMessage:message,
        id:data.senderId
    }))
  }
  else{
    if(data.senderId){
    const res=await axios.get(`/api/chat/newFriendReceive/${data.senderId}`);
    dispatch(addFriend({
        id:data.senderId,
        name:res.data.name,
        email:res.data.email,
        profileImage:res.data.profileImage,
        youBlocked: null,
        blockedYou: null,
        conversationId:data.conversationId
    }))
    dispatch(addChatMeta({
        id:data.senderId,
        lastMessage:data.message,
        lastMessageTime:new Date().toISOString(),
        unreadCount:null,
        deletedUntil:null
    }))
    if(data.senderId==selectedUserId){
        dispatch(addMessages({
            conversationId:data.conversationId,
            senderId:data.senderId,
            receiverId:data.receiverId,
            message:data.message,
            messageType:data.messageType,
        }))
    }
    }

}
  
})
}