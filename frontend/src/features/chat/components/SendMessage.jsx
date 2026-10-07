import React, { useRef } from 'react'
import SendFile from './SendFile'
import { useState } from 'react'
import { useDispatch ,useSelector} from 'react-redux'
import { addLastMessage, addMessages } from '../state/chat';
import { getSocket } from '../../../socket/socketClient';
import DeleteIcon from '../../../assets/DeleteIcon';
import { updateDeleteMode,clearSelectedMessagesDeletion,updateDeleteMessageConfirmation,clearDeleteForEveryOneEnabler} from '../state/chat';
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
      if(conversations[selectedUserId]){
        const participants=conversations[selectedUserId].participants;
        receiverId=participants.filter(id=>id!=senderId);
      }
      const time = new Date();
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
      let blocked=false;
      if(conversationType=="dm"){
        blocked=friends?.byId[selectedUserId]?.blockedYou ?? false;
      }
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
  const deleteMode=useSelector(state=>state.chat.deleteMode);
  const selectedMessages=useSelector(state=>state.chat.selectedMessagesDeletion);
  const size=selectedMessages.length;
  const blocked=friends?.byId[selectedUserId]?.youBlocked ?? false;
  return (
    <>
    <div className=' w-full h-[8%] p-2 justify-center items-center  flex mt-4'>
        {deleteMode ?<div className='w-[90%] flex h-10 rounded-full bg-[#161717] justify-between'>
            <div className='flex items-center'>
              <button onClick={()=>{dispatch(updateDeleteMode(false)); dispatch(clearSelectedMessagesDeletion()); dispatch(clearDeleteForEveryOneEnabler());}}>
              <img className='h-4 w-4 ml-2' src='/images/cross.png '></img>
              </button>
              <p className='ml-4'>Selected {size}</p>
            </div>
            <div className='flex items-center'>
                <button onClick={()=>{dispatch(updateDeleteMessageConfirmation(true))}}>
                <DeleteIcon/>
                </button>
            </div>
        </div>:
          !blocked?(
            <>
            <SendFile/>
          <form className=' w-[90%] h-10 rounded-full flex bg-[#161717]' onSubmit={(e) => { e.preventDefault(); sendMessage();}}>
            <input type='text' className='ml-[4px] rounded-md bg-[#161717] h-[100%] w-[98%] outline-none focus:outline-none focus:ring-0  ' 
            value={textMsg}
            onChange={handelChange}
           
            ></input>
            <button type="submit">
              <img className='w-8 h-8 ' src='/images/send.png' onClick={sendMessage}/>
            </button>
        </form> 
        </>):null 
        }
    </div>
    </>
  )
}

export default SendMessage