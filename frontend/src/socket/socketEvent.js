import { getSocket } from "./socketClient";
import { useSelector} from "react-redux";
import { addChatMeta, addFriend, setChatMeta, addPresence ,addMessages,addLastMessage, addConversations, setSelectedConversationId,updateMessageStatus,updateChatMeta,updateLastMessageStatus,updateMessageId,updateUserTyping,updateChatMetaTypingStatus,updateTotalNotificationCount,deleteMessageForEveryOne,updateLastMessageContent,updateBlockedYoustatus} from "../features/chat/state/chat";
import axios from "axios";
import store from '../store'
import { updateDownloadedBytes,saveChunk,deleteFile,setFile,updateCacheStatus ,deleteChunksByMediaId,markDownloadFailed,updateFileStatus,getMediaFile} from "../features/chat/services/indexedDbServices";
import { updateBytesDownloadQueue, updateStatusDownloadQueue } from "../features/chat/state/media";
import { chunksToFile } from "../features/chat/services/downloader";
import { addMediaStore } from "../features/chat/state/media";
import { startupload } from "../features/chat/services/uploader";
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
    console.log("CONVERSSSATIONIDff ",data.conversationId);
    const user=store.getState().auth.userData;
    const userId=user.id;
    dispatch(setSelectedConversationId(data.conversationId));
    let lastMessage=data.message;
      if(lastMessage.length>20){
        lastMessage=lastMessage.slice(0,15)+".....";
      }
    if(data.receiverId[0]){
    const res=await axios.get(`/api/chat/newFriendSend/${data.receiverId[0]}`);
    dispatch(addFriend({
        id:data.receiverId[0],
        name:res.data.name,
        email:res.data.email,
        profileImage:res.data.profileImage,
        youBlocked: false,
        blockedYou: false,
        conversationId:data.conversationId
    }))
    dispatch(addChatMeta({
        id:data.conversationId,
        lastMessage:lastMessage,
        lastMessageId:data.messageId,
        lastMessageTime:new Date().toISOString(),
        lastMessageStatus:false,
        lastMessageWaitStatus:false,
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
    const selectedConversationId=store.getState().chat.selectedConversationId;
    const selectedConversationType=store.getState().chat.selectedConversationType;
    const byId=friends.byId;
    const user=store.getState().auth.userData;
    const userId=user.id;
    const conversations=store.getState().chat.conversations
    const cbyId=conversations.byId;
    let mediaDetails=null;
    let lastMessage=data.message;
    if(lastMessage.length>20 && data.messageType=="text"){
        lastMessage=lastMessage.slice(0,15)+".....";
    }
    else if(data.messageType=="media"){
        mediaDetails=await axios.get(`/api/chat/getMediaDetails/${data.message}`);
        console.log("Mediadetails",mediaDetails);
        lastMessage=`${mediaDetails.data.category} received`
        const mediaStore=store.getState().media.MediaStore;
        if(!mediaStore.byId[data.message]){
            dispatch(addMediaStore(mediaDetails.data));
        }
        console.log("SIZE ",mediaDetails.data.size);
        await setFile("downloadedFiles",data.message,undefined,mediaDetails.data.size,true);
        
    }
    if(byId[data.senderId] || cbyId[data.conversationId]){

    dispatch(addLastMessage({
        lastMessage:lastMessage,
        lastMessageId:data.messageId,
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
        youBlocked: false,
        blockedYou: false,
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
        lastMessage:lastMessage,
        lastMessageTime:new Date().toISOString(),
        lastMessageId:data.messageId,
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
            _id:data.messageId,
            deleteBy:[],
            deletedForEveryOne:false
        }))
        console.log("messagerRcived");
        const blocked=friends?.byId[selectedUserId]?.youBlocked ?? false;
        console.log("this user "+friends?.byId[selectedUserId]?.name+" is blocked "+blocked);
        if(!blocked){
        socket.emit('messageReceived',{
            conversationId:data.conversationId,
            messageId:data.messageId,
            participants:participants
        })
        }
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
            intervals:data.intervals
        }));
    }
    console.log("messageReceived");
    dispatch(updateLastMessageStatus({
        conversationId:data.conversationId,
        intervals:data.intervals
    }));
    
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
            intervals:data.intervals
        }));
    }
    console.log("openedConv");
    if(Object.keys(chatMeta).length !== 0){
    dispatch(updateLastMessageStatus({
        conversationId:data.conversationId,
        intervals:data.intervals
    }));
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
socket.on('deleteMessageForEveryOne',async(data)=>{
    console.log("game of thrones");
    const selectedConversationId=store.getState().chat.selectedConversationId;
    const chatMeta=store.getState().chat.chatMeta;
    console.log(selectedConversationId+ " "+data.conversationId);
    if(selectedConversationId==data.conversationId){
        console.log("jon snow");
        dispatch(deleteMessageForEveryOne(data.selectedMessagesDeletion));
    }
    data.selectedMessagesDeletion.forEach((id)=>{
        for(const [cid,conv] of Object.entries(chatMeta)){
                if(cid===data.conversationId && conv.lastMessageId===id){
                    console.log("wowwwwwww");
                    dispatch(updateLastMessageContent(cid))
                    break;
                }
        }
    })
    
})
socket.on('blocked',async(data)=>{
    dispatch(updateBlockedYoustatus({
        id:data.userId,
        status:true
    }))
})
socket.on('unblocked',async(data)=>{
    console.log("voldemort");
    dispatch(updateBlockedYoustatus({
        id:data.userId,
        status:false
    }))
})
socket.on("media:chunk", async (data, ack) => {

    console.log("chunk incoming");

    try {

        await saveChunk(
            data.mediaId,
            data.startByte,
            data.endByte,
            data.chunk
        );

        const downloadedBytes = data.endByte + 1;

        dispatch(updateBytesDownloadQueue({
            downloadedBytes,
            mediaId: data.mediaId
        }));

        await updateDownloadedBytes(
            "downloadedFiles",
            data.mediaId,
            downloadedBytes
        );

       
        ack();

    } catch (error) {
        console.error("Error processing chunk:", error);
        ack({
            error: error.message
        });
    }
});
socket.on('media:complete',async(data)=>{
    console.log("chunk completed");
    const state = store.getState();
    const mediaStore=state.media.MediaStore;
    const file=await chunksToFile(data.mediaId,mediaStore.byId[data.mediaId].name,mediaStore.byId[data.mediaId].mimeType);
    if (!file) {
            throw new Error("No chunks found");
    }
    await deleteFile("downloadedFiles",data.mediaId);
    console.log("DELETED OLD FILE:", data.mediaId);
    await deleteChunksByMediaId(data.mediaId);
    await setFile("downloadedFiles",data.mediaId,file,mediaStore.byId[data.mediaId].size);
    console.log(
    "AFTER SETFILE:",
    await getMediaFile("downloadedFiles", data.mediaId)
);
    await updateFileStatus('downloadedFiles',data.mediaId,"completed");
    console.log(
    "AFTER STATUS:",
    await getMediaFile("downloadedFiles", data.mediaId)
);
    store.dispatch(updateStatusDownloadQueue({
        mediaId:data.mediaId,
        status:"completed"
    }))
   
})
socket.on('media:error',async(data)=>{
    console.log("media error");
    await deleteChunksByMediaId(data.mediaId);
    await markDownloadFailed('downloadedFiles',data.mediaId);
    store.dispatch(updateStatusDownloadQueue({
        mediaId:data.mediaId,
        status:"failed"
    }))
    await updateFileStatus('downloadedFiles',mediaId,"failed");
})
socket.on('startUpload',async(data,callback)=>{
    console.log('START UPLOAD')
    const mediaId=data.mediaId;
    const state = store.getState();
    const uploadQueue=state.media.uploadQueue;
    if(uploadQueue?.byId[mediaId]?.status==="requesting"){
        callback({
            accepted:true
        })
        startupload(mediaId);
    }
    else{
        callback({
            accepted:false
        })
    }
})



}

