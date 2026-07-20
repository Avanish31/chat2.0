import React from 'react'
import { Link } from 'react-router-dom'
import Notification from './Notification'
import { useNavigate } from 'react-router-dom'
import { useSelector,useDispatch } from 'react-redux'
import { setMessages ,setSelectedUserId} from '../state/chat'
import axios from 'axios'
function ChatCard({name,profileImage,lastMessage=null,unreadCount=0 ,id=null,type,lastMessageStatus=null,lastSenderId=null,lastMessageTime=null,isTyping=false}) {
  const navigate=useNavigate();
  const dispatch=useDispatch();
  const friends=useSelector(state=>state.chat.friends);

  const handleChatWindow=async()=>{
  navigate(`/chat/${id}?type=${type}`);
  
  }
  console.log(name+" " +unreadCount);
  let blocked=false;
  if(type=="dm"){
    blocked=friends?.byId[id]?.blockedYou??false
  }
  return (
    <>
    
    <div className=' w-full flex items-center gap-4 hover:bg-[rgb(61,59,59)] mb-4' onClick={()=>handleChatWindow()}>
    {blocked?<img className="w-20 h-20 rounded-full" src='/images/blockedProfilePhoto.png'/>:<img className="w-20 h-20 rounded-full" src={profileImage}/>}
    <div className='flex flex-col w-[90%]  text-white text-[20px]'>
    <div className='flex '>
    <p className='w-[80%]'>{name}</p>
    <p>{lastMessageTime!=null && lastMessageTime}</p>
    </div>
    <Notification unreadCount={unreadCount} lastMessageStatus={lastMessageStatus} lastSenderId={lastSenderId} lastMessage={lastMessage} isTyping={isTyping}/>
    </div>
    </div>
    
    </>
  )
}

export default ChatCard