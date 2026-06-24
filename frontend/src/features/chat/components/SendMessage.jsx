import React from 'react'
import SendFile from './SendFile'
import { useState } from 'react'
import { useDispatch ,useSelector} from 'react-redux'
import { addLastMessage, addMessages } from '../state/chat';
import { getSocket } from '../../../socket/socketClient';
function SendMessage() {
  const[textMsg,settextMsg]=useState("");
  const message=textMsg
  const dispatch=useDispatch();
  const receiverId=useSelector(state=>state.chat.selectedUserId);
  const friends=useSelector(state=>state.chat.friends);
  const byId=friends.byId;
  const conversationId=byId[receiverId]?.conversationId;
  const user=useSelector(state=>state.auth.userData);
  const senderId=user?.id;
  const sendMessage=()=>{
    console.log('send button clicked');
    dispatch(addMessages({
    conversationId:conversationId,
    senderId:senderId,
    receiverId:receiverId,
    message:message,
    messageType:"text",
    }))
    
    const socket=getSocket();
    socket.emit('sendMessage',{
      conversationId:conversationId,
      senderId:senderId,
      receiverId:receiverId,
      message:message,
      messageType:"text",
    })

    if(conversationId){
      dispatch(addLastMessage({
        lastMessage:message,
        id:receiverId
      }))
    }

    settextMsg("");
  }
  return (
    <>
    <div className=' w-full h-[8%] p-2 justify-center items-center  flex mt-4'>
        <form className=' w-[90%] h-10 rounded-full flex bg-[#161717]' onSubmit={(e) => { e.preventDefault(); sendMessage();}}>
            <SendFile/>
            <input type='text' className='ml-[4px] rounded-full bg-[#161717] h-[100%] w-[92%] outline-none focus:outline-none focus:ring-0' 
            value={textMsg}
            onChange={e=>settextMsg(e.target.value)}
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