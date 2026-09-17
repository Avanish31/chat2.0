import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useRef,useEffect } from 'react';
import { updateDeleteMode,updateDeleteMessageConfirmation,clearSelectedMessagesDeletion ,clearDeleteForEveryOneEnabler,updateSelectedMessagesDeletion,updateDeleteForEveryOneEnabler} from '../state/chat';
function DeleteChat() {
    const [isOpen,setIsOpen]=useState(false);
    const dispatch=useDispatch();
    const messages=useSelector(state=>state.chat.messages);
    const userData=useSelector(state=>state.auth.userData);
    const userId=userData?.id;
    const handleDeleteMessage=()=>{
      setIsOpen(false);
      dispatch(updateDeleteMode(true));
    }
    const handleClearChat=()=>{
      setIsOpen(false);
      dispatch(updateDeleteMode(true));
      messages.forEach((msg)=>{
      if(!msg.deleteBy.includes(userId)){
        dispatch(updateSelectedMessagesDeletion(msg._id));
        if(msg.senderId!=userId || msg.deletedForEveryOne){
            dispatch(updateDeleteForEveryOneEnabler(1));
        }
      }
      })
      
    }
    const containerRef = useRef(null);
    
    useEffect(() => {
      function handleClickOutside(e) {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target)
        ) {
          setIsOpen(false);
        }
      }
    
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  return (
   <div  ref={containerRef} className="relative inline-block">
  <button onClick={()=>setIsOpen(prev=>!prev)}>
    <img
      className="w-8 h-8 rounded-full"
      src="/images/delete.png"
      alt="delete"
    />
  </button >

  {isOpen &&<div className="absolute top-full right-0  h-40 w-40 bg-[#262727] rounded-md shadow-lg flex flex-col justify-evenly z-50" >
    <button className='flex pl-4 h-[33.33%] hover:bg-[rgb(61,59,59)] items-center rounded-md'onClick={handleDeleteMessage}>Delete messages</button>
    <button className='flex pl-4 h-[33.33%] hover:bg-[rgb(61,59,59)] items-center rounded-md' onClick={handleClearChat}>Clear Chat</button>
  </div>
}
</div>
  )
}

export default DeleteChat