import { getSocket } from "./socketClient";
import { useSelector} from "react-redux";
import { addChatMeta, addFriend, setChatMeta, addPresence ,addMessages,addLastMessage} from "../features/chat/state/chat";
import axios from "axios";
import store from '../store'
let init=false;

export function resetSocketInit() {
    init = false;
}
export function initSocket(socket,dispatch){
    
if(!socket){
    return;
}
if(init){
    return;
}
console.log("Registering userOnline listener");
init=true;
console.log('inisde socket');
socket.on('userOnline',async(data)=>{
    console.log("user "+ data.userId+" came online");
        dispatch(addPresence({
            id:data.userId,
            status:true,
            lastseen:null,
        }))
})

socket.on('userOffline',async(data)=>{
        dispatch(addPresence({
            id:data.userId,
            status:false,
            lastseen:data.lastseen
        }));
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
    const friends = store.getState().chat.friends;
    const selectedUserId=store.getState().chat.selectedUserId;
    const byId=friends.byId;
    console.log(selectedUserId+ " and "+ data.senderId);
    console.log(data.senderId, typeof data.senderId);
console.log(selectedUserId, typeof selectedUserId);
  if(byId[data.senderId]){
    dispatch(addLastMessage({
        lastMessage:data.message,
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
}
  }
    if(data.senderId===selectedUserId){
        console.log("firing addMessages");
        dispatch(addMessages({
            conversationId:data.conversationId,
            senderId:data.senderId,
            receiverId:data.receiverId,
            message:data.message,
            messageType:data.messageType,
        }))
    }
    

})
}
