import React from 'react'
import SendBubble from './SendBubble'
import RecieveBubble from './RecieveBubble'
import { useSelector } from 'react-redux';
import { useEffect, useRef } from "react";
function ChatWindow() {
  const messages=useSelector((state)=>state.chat.messages);
  const user=useSelector((state)=>state.auth.userData);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  return (
    <div className='h-[80%] overflow-y-auto  text-white border-b border-b-blue-400 w-full no-scrollbar '>
    {messages.map((msg,index)=>{
      return msg.senderId===user.id?<SendBubble key={index} message={msg.message} messageType={msg.messageType} status={msg?.status} time={msg.messageTime} id={msg?._id}/>:<RecieveBubble message={msg.message} key={index} messageType={msg.messageType} time={msg.messageTime} id={msg?._id}/>
    })}
    
    <div ref={messagesEndRef} />
    </div >
  )
}

export default ChatWindow