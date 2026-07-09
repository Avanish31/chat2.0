import React, { useRef } from 'react'
import SendFile from './SendFile'
import { useState } from 'react'
import { useDispatch ,useSelector} from 'react-redux'
import { addLastMessage, addMessages } from '../state/chat';
import { getSocket } from '../../../socket/socketClient';
function SendMessage() {
  const[textMsg,settextMsg]=useState("");
  const message=textMsg
  const dispatch=useDispatch();
  const selectedUserId=useSelector(state=>state.chat.selectedUserId);
  let receiverId=[selectedUserId];
  const friends=useSelector(state=>state.chat.friends);
  const byId=friends.byId;
  const conversationId=useSelector(state=>state.chat.selectedConversationId);
  console.log(conversationId);
  const conversations=useSelector(state=>state.chat.conversations);
  const conversationType=useSelector(state=>state.chat.selectedConversationType);
  const user=useSelector(state=>state.auth.userData);
  const senderId=user?.id;
  const socket=getSocket();
  const sendMessage=()=>{
    console.log('send button clicked');
    if(message.length>0){
      const tempId = crypto.randomUUID();
      if(conversations[selectedUserId] && conversationType=="group"){
        const participants=conversations[selectedUserId].participants;
        receiverId=participants.filter(id=>id!=senderId);
      }
      const time = new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();
      dispatch(addMessages({
        conversationId:conversationId,
        senderId:senderId,
        receiverId:receiverId,
        message:message,
        messageType:"text",
        messageTime:time,
        status:false,
        tempId:tempId,
        messageId:null
      }))
      socket.emit('sendMessage',{
      conversationId:conversationId,
      senderId:senderId,
      receiverId:receiverId,
      message:message,
      messageType:"text",
      messageTime:time,
      conversationType:conversationType,
      tempId:tempId
    })

    if(conversationId){
      dispatch(addLastMessage({
        lastMessage:message,
        lastMessageStatus:false,
        lastSenderId:senderId,
        lastMessageTime:new Date().toISOString(),
        id:conversationId
      }))
    }
    }

    settextMsg("");
  }
  const stopTypingTimer=useRef(null);
  const isTyping=useRef(false);
  const handelChange=(e)=>{
    const value=e.target.value;
    settextMsg(value);
    let participants=[selectedUserId];
    if(conversationId){
      const cbyId=conversations.byId;
      participants=cbyId[conversationId].participants.filter(id=>id!==senderId);
    }
    if(!isTyping.current){
      socket.emit('userTyping',{
        userId:senderId,
        conversationId:conversationId,
        participants:participants
      })
      isTyping.current=true;
    }
    clearTimeout(stopTypingTimer.current);
    stopTypingTimer.current=setTimeout(()=>{
      socket.emit('userNotTyping',{
        userId:senderId,
        conversationId:conversationId,
        participants:participants
      })
      isTyping.current = false;
    },1000)
  }
  return (
    <>
    <div className=' w-full h-[8%] p-2 justify-center items-center  flex mt-4'>
        <form className=' w-[90%] h-10 rounded-full flex bg-[#161717]' onSubmit={(e) => { e.preventDefault(); sendMessage();}}>
            <SendFile/>
            <input type='text' className='ml-[4px] rounded-full bg-[#161717] h-[100%] w-[92%] outline-none focus:outline-none focus:ring-0' 
            value={textMsg}
            onChange={handelChange}
            ></input>
            <button type="submit">
              <img className='w-8 h-8 ' src='/images/send.png' onClick={sendMessage}/>
            </button>
        </form>
    </div>
    </>
  )
}

export default SendMessage