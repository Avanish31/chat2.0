import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { updateDeleteMode } from '../state/chat';
function DeleteChat() {
    const [isOpen,setIsOpen]=useState(false);
    const dispatch=useDispatch();
    const handleDeleteMessage=()=>{
      setIsOpen(false);
      dispatch(updateDeleteMode(true));
    }
    const handleClearChat=()=>{
      setIsOpen(false);
    }
  return (
   <div className="relative inline-block">
  <button onClick={()=>setIsOpen(true)}>
    <img
      className="w-8 h-8 rounded-full"
      src="/images/delete.png"
      alt="delete"
    />
  </button >

  {isOpen &&<div className="absolute top-full right-0  h-40 w-40 bg-[#262727] rounded-md shadow-lg flex flex-col justify-evenly" >
    <button className='flex pl-4 h-[33.33%] hover:bg-[rgb(61,59,59)] items-center rounded-md'onClick={handleDeleteMessage}>Delete messages</button>
    <button className='flex pl-4 h-[33.33%] hover:bg-[rgb(61,59,59)] items-center rounded-md' onClick={handleClearChat}>Clear Chat</button>
    <button className='flex pl-4 h-[33.33%] hover:bg-[rgb(61,59,59)] items-center rounded-md' onClick={()=>{setIsOpen(false)}}>Close</button>
  </div>
}
</div>
  )
}

export default DeleteChat