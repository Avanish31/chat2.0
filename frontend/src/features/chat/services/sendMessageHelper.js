import { useSelector } from "react-redux";
import { addLastMessage,addMessages } from "../state/chat";
import store from "../../../store";
export default  function sendMessageHelper({
    message,
    dispatch,
    conversationId,
    selectedUserId,
    conversations,
    senderId,
    conversationType,
    socket,
    forwardMode=false
}){    
        let receiverId=[selectedUserId];
        console.log('send button clicked');
        if(message.length>0){
          const tempId = crypto.randomUUID();
          if(conversations.byId[conversationId]){
            const participants=conversations.byId[conversationId]?.participants;
            receiverId=participants.filter(id=>id!=senderId);
         }
          console.log("selectedUserId",conversations.byId[conversationId]?.participants);
          console.log("Recievers",receiverId)
          const time = new Date();
          const selectedConversationId=store.getState().chat.selectedConversationId;
          if(conversationId==selectedConversationId){
          dispatch(addMessages({
            conversationId:conversationId,
            senderId:senderId,
            receiverId:receiverId,
            message:message,
            messageType:"text",
            messageTime:time.toISOString(),
            sendTime:time.toISOString(),
            receiveTime:time.toISOString(),
            createdAt:new Date().toISOString(),
            status:false,
            tempId:tempId,
            deleteBy:[],
            deletedForEveryOne:false,
            dummy:false
          }))
        }
          const friends=store.getState().chat.friends;
          let blocked=false;
          if(conversationType=="dm"){
            
            blocked=friends?.byId[receiverId[0]]?.blockedYou ?? false;
          }
          console.log("blookced ",blocked,friends?.byId[receiverId[0]]?.blockedYou," ",conversationType)
          socket.emit('sendMessage',{
          conversationId:conversationId,
          senderId:senderId,
          receiverId:receiverId,
          message:message,
          messageType:"text",
          messageTime:time,
          conversationType:conversationType,
          tempId:tempId,
          blocked:blocked,
          dummy:false
        })
    
        if(conversationId){
          let lastMessage=message;
          if(lastMessage.length>20){
            lastMessage=lastMessage.slice(0,15)+".....";
          }
          dispatch(addLastMessage({
            lastMessage:lastMessage,
            lastMessageStatus:false,
            lastSenderId:senderId,
            lastMessageTime:new Date().toISOString(),
            lastMessageWaitStatus:false,
            lastMessageId:tempId,
            id:conversationId
          }))
        }
        }
    
        
      
}