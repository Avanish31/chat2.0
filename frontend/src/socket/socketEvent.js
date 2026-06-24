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
    console.log(selectedUserId);
    if(selectedUserId){
    const res=await axios.get(`/api/chat/newFriendSend/${selectedUserId}`);
    dispatch(addFriend({
        id:selectedUserId,
        name:res.data.name,
        email:res.data.email,
        profileImage:res.data.profileImage,
        youBlocked: null,
        blockedYou: null,
        conversationId:data.conversationId
    }))
    dispatch(addChatMeta({
        id:selectedUserId,
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
        id:selectedUserId
    }))
  }
  else{
    if(selectedUserId){
    const res=await axios.get(`/api/chat/newFriendReceive/${selectedUserId}`);
    dispatch(addFriend({
        id:selectedUserId,
        name:res.data.name,
        email:res.data.email,
        profileImage:res.data.profileImage,
        youBlocked: null,
        blockedYou: null,
        conversationId:data.conversationId
    }))
    dispatch(addChatMeta({
        id:selectedUserId,
        lastMessage:data.message,
        lastMessageTime:new Date().toISOString(),
        unreadCount:null,
        deletedUntil:null
    }))
}

  }
  dispatch(addMessages({
    conversationId:data.conversationId,
    senderId:data.senderId,
    receiverId:data.receiverId,
    message:data.message,
    messageType:data.messageType,
  }))
})
}