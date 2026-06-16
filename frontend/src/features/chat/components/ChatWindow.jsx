import React from 'react'
import SendBubble from './SendBubble'
import RecieveBubble from './RecieveBubble'
import { useSelector } from 'react-redux';
function ChatWindow() {
   const messages=useSelector((state)=>state.chat.messages);
  const userId=useSelector((state)=>state.auth.userData);
  return (
    <div className='h-[80%] overflow-y-auto  text-white border-b border-b-blue-400 w-full no-scrollbar '>
    {messages.map((msg)=>{
      msg.senderId===userId?<SendBubble message={msg.message} messageType={msg.messageType}/>:<RecieveBubble message={msg.message} messageType={msg.messageType}/>
    })}
    
    
    </div>
  )
}

export default ChatWindow