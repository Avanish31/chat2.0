import React from 'react'
import { Link } from 'react-router-dom'
import Notification from './Notification'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setMessages ,setSelectedUserId} from '../state/chat'
import axios from 'axios'
function ChatCard({name,profileImage,lastMessage=null,unreadCount=0 ,id,conversationId=null}) {
  const navigate=useNavigate();
  const dispatch=useDispatch();
  const handleChatWindow=async()=>{
    if(conversationId){
      await axios.get(`/api/chat/${conversationId}`).then((res)=>{
        dispatch(setMessages(res.data.messages));
      });
       
    }
    dispatch(setSelectedUserId(id));
    
    navigate(`/chat/${id}`)
  }
  return (
    <>
    
    <div className=' w-full flex items-center gap-4 hover:bg-[rgb(61,59,59)]' onClick={()=>handleChatWindow()}>
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