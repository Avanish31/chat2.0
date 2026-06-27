import React from 'react'
import { Link } from 'react-router-dom'
import Notification from './Notification'
import { useNavigate } from 'react-router-dom'
import { useSelector,useDispatch } from 'react-redux'
import { setMessages ,setSelectedUserId,setRealTimeData} from '../state/chat'
import axios from 'axios'
function ChatCard({name,profileImage,lastMessage=null,unreadCount=0 ,id}) {
  const navigate=useNavigate();
  const dispatch=useDispatch();

  // const onlineUsers=useSelector((state)=>state.chat.onlineUsers);
  const handleChatWindow=async()=>{
    navigate(`/chat/${id}`);
    
  }
  return (
    <>
    
    <div className=' w-full flex items-center gap-4 hover:bg-[rgb(61,59,59)] mb-4' onClick={()=>handleChatWindow()}>
    <img className="w-20 h-20 rounded-full" src={profileImage}/>
    <div className='flex flex-col w-[90%]  text-white text-[20px]'>
    <p >{name}</p>
    <Notification unreadCount={unreadCount} lastMessage={lastMessage}/>
    </div>
    </div>
    
    </>
  )
}

export default ChatCard