import { getSocket } from "./socketClient";
import { useSelector} from "react-redux";
import { addChatMeta, addFriend, setChatMeta, addPresence ,addMessages,addLastMessage, addConversations, setSelectedConversationId,updateMessageStatus,updateChatMeta,updateLastMessageStatus,updateMessageId,updateUserTyping,updateChatMetaTypingStatus,updateTotalNotificationCount} from "../features/chat/state/chat";
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
socket.on("connect", () => {
    console.log("Client socket id:", socket.id);
});

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
console.log("Client socket id:", socket.id);
socket.on('conversationId',async(data)=>{
    console.log("convesrationId ");
    const user=store.getState().auth.userData;
    const userId=user.id;
    dispatch(setSelectedConversationId(data.conversationId));
    if(data.receiverId[0]){
    const res=await axios.get(`/api/chat/newFriendSend/${data.receiverId[0]}`);
    dispatch(addFriend({
        id:data.receiverId[0],
        name:res.data.name,
        email:res.data.email,
        profileImage:res.data.profileImage,
        youBlocked: null,
        blockedYou: null,
        conversationId:data.conversationId
    }))
    dispatch(addChatMeta({
        id:data.conversationId,
        lastMessage:data.message,
        lastMessageTime:new Date().toISOString(),
        lastMessageStatus:false,
        lastSenderId:userId,
        unreadCount:null,
        deletedUntil:null,
        isTyping:false
    }))
    dispatch(addConversations({
        id:data.conversationId,
        type:"dm",
        participants:[userId,data.receiverId[0]],
        groupName:null,
        groupProfilePhoto:null
    }))

    }

})

socket.on('receiveMessage',async(data)=>{
    console.log("receiveMessage");
  
    const chatActivity = window.location.pathname.startsWith("/chat");
    if(chatActivity){
    const friends = store.getState().chat.friends;
    const selectedUserId=store.getState().chat.selectedUserId;
    const selectedConversationId=store.getState().chat.selectedConversationId
    const byId=friends.byId;
    const user=store.getState().auth.userData;
    const userId=user.id;
    const conversations=store.getState().chat.conversations
    const cbyId=conversations.byId;
    if(byId[data.senderId] || cbyId[data.conversationId]){
    dispatch(addLastMessage({
        lastMessage:data.message,
        id:data.conversationId,
        lastMessagesStatus:false,
        lastSenderId:data.senderId,
        lastMessageTime:new Date().toISOString(),
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
    dispatch(addConversations({
        id:data.conversationId,
        type:"dm",
        participants:[userId,data.senderId],
        groupName:null,
        groupProfilePhoto:null
    }))
    dispatch(addChatMeta({
        id:data.conversationId,
        lastMessage:data.message,
        lastMessageTime:new Date().toISOString(),
        lastMessagesStatus:false,
        lastSenderId:data.senderId,
        unreadCount:null,
        deletedUntil:null,
        isTyping:false
    }))
}
  }
   let conv2=store.getState().chat.conversations;
   const participants=conv2.byId[data.conversationId].participants.filter(id=>id!==userId)
    if(data.senderId===selectedUserId || data.conversationId===selectedConversationId){
        console.log("firing addMessages");
        dispatch(addMessages({
            conversationId:data.conversationId,
            senderId:data.senderId,
            receiverId:[data.receiverId],
            message:data.message,
            messageType:data.messageType,
            messageTime:data.messageTime,
            _id:data.messageId
        }))
        console.log("messagerRcived");
        socket.emit('messageReceived',{
            conversationId:data.conversationId,
            messageId:data.messageId,
            participants:participants
        })
    }
    else{
       dispatch(updateChatMeta(data.conversationId));
    }
}
else{
    dispatch(updateTotalNotificationCount())
}

})

socket.on('messageReceived',async(data)=>{
    const selectedConversationId=store.getState().chat.selectedConversationId
    const user=store.getState().auth.userData;
    const userId=user.id;
    if(data.conversationId===selectedConversationId){
        console.log("message Recieved");
        dispatch(updateMessageStatus({
            id:userId,
        }));
    }
    console.log("messageReceived");
    dispatch(updateLastMessageStatus(data.conversationId));
    
})
socket.on('openedConv',async(data)=>{
    const selectedConversationId=store.getState().chat.selectedConversationId;
    const user=store.getState().auth.userData;
    const userId=user.id;
    const chatMeta=store.getState().chat.chatMeta;
    if(data.conversationId===selectedConversationId){
        console.log("message Recieved");
        dispatch(updateMessageStatus({
            id:userId,
        }));
    }
    console.log("openedConv");
    if(Object.keys(chatMeta).length !== 0){
    dispatch(updateLastMessageStatus(data.conversationId));
    }
})

socket.on('messageSaved',(data)=>{
    const selectedConversationId=store.getState().chat.selectedConversationId;
    if(data.convId===selectedConversationId){
        dispatch(updateMessageId({
            tempId:data.tempId,
            messageId:data.messageId,
        }))
    }
})
socket.on('userTyping',async(data)=>{
    console.log("usertyping.........................")
    const selectedConversationId=store.getState().chat.selectedConversationId;
    const selectedUserId=store.getState().chat.selectedUserId;
    const convesrations=store.getState().chat.conversations;
    const cbyId=convesrations.byId
    if(selectedUserId===data.userId || selectedConversationId===data.conversationId){
            dispatch(updateUserTyping(true));
    }
    if(data.conversationId && cbyId[data.conversationId]){
        dispatch(updateChatMetaTypingStatus({
            conversationId:data.conversationId,
            status:true
        }))
    }
})
socket.on('userNotTyping',async(data)=>{
    console.log("userNottyping.........................")
    const selectedConversationId=store.getState().chat.selectedConversationId;
    const selectedUserId=store.getState().chat.selectedUserId;
    const convesrations=store.getState().chat.conversations;
    const cbyId=convesrations.byId
    if(selectedUserId===data.userId || selectedConversationId===data.conversationId){
            dispatch(updateUserTyping(false));
    }
    if(data.conversationId && cbyId[data.conversationId]){
        dispatch(updateChatMetaTypingStatus({
            conversationId:data.conversationId,
            status:false
        }))
    }
})
}

