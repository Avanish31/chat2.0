import React, { useEffect } from 'react'
import SideBar from './SideBar'
import MainBar from './MainBar'
import { chatAuth } from '../../auth/services/chatAuth'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedUserId } from '../state/chat'
import { useState } from 'react'
import { updateDeleteMessageConfirmation,updateDeleteMode,clearSelectedMessagesDeletion } from '../state/chat'
function Chat() {
  const dispatch=useDispatch();
  const navigate=useNavigate();

  useEffect(()=>{
    chatAuth(dispatch,navigate);
    
    return () => {
      dispatch(setSelectedUserId(null));
      
    };
  },[dispatch])
  const deleteMessageConfirmation=useSelector(state=>state.chat.deleteMessageConfirmation);
  const selectedMessagesDeletion=useSelector(state=>state.chat.selectedMessagesDeletion);
  const deleteForEveryOneEnabler=useSelector(state=>state.chat.deleteForEveryOneEnabler);
  const handleDeleteEveryone=()=>{
    dispatch(updateDeleteMessageConfirmation(false));
    dispatch(updateDeleteMode(false));
    dispatch(clearSelectedMessagesDeletion());
  }
  const handleDeleteForMe=()=>{
    dispatch(updateDeleteMessageConfirmation(false));
    dispatch(updateDeleteMode(false));
    dispatch(clearSelectedMessagesDeletion());
  }
  const handleCancel=()=>{
    dispatch(updateDeleteMessageConfirmation(false));
  }
  return (
    <>
    <div className='w-full flex'>
    <SideBar/>
    <MainBar/>
    {deleteMessageConfirmation && <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="h-40 w-80  bg-[#161717] rounded-lg shadow-lg  text-white flex flex-col ">
        {deleteForEveryOneEnabler==0?<button className='flex pl-4 flex-1  hover:bg-[rgb(61,59,59)] items-center rounded-md' onClick={handleDeleteEveryone}>Delete for everyone </button>:null}
        <button className='flex flex-1 pl-4  hover:bg-[rgb(61,59,59)] items-center rounded-md' onClick={handleDeleteForMe}>Delete for me</button>
        <button className='flex  flex-1 pl-4  hover:bg-[rgb(61,59,59)] items-center rounded-md'onClick={handleCancel}>Cancel</button>
      </div>    
   </div>}
    </div>
    </>
  )
}

export default Chat