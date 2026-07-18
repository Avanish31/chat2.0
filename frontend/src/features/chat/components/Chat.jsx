import React, { useEffect } from 'react'
import SideBar from './SideBar'
import MainBar from './MainBar'
import { chatAuth } from '../../auth/services/chatAuth'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedUserId } from '../state/chat'
import { useState } from 'react'
import { updateDeleteMessageConfirmation,updateDeleteMode,clearSelectedMessagesDeletion,deleteMessageForEveryOne,deleteMessageForMe ,updateLastMessageContent,updateLastMessageDeleteForMe,clearDeleteForEveryOneEnabler} from '../state/chat'
import axios from 'axios'
import { getSocket } from '../../../socket/socketClient'
function Chat() {
  const dispatch=useDispatch();
  const navigate=useNavigate();
  const selectedConversationId=useSelector(state=>state.chat.selectedConversationId);
  const conversations=useSelector(state=>state.chat.conversations);
  const userData=useSelector(state=>state.auth.userData);
  const chatMeta=useSelector(state=>state.chat.chatMeta);
  const selectedMessagesDeletion=useSelector(state=>state.chat.selectedMessagesDeletion);
  const userId=userData?.id;
  const cbyId=conversations.byId;
  const socket=getSocket();
  useEffect(()=>{
    chatAuth(dispatch,navigate);
    
    return () => {
      dispatch(setSelectedUserId(null));
      
    };
  },[dispatch])
  const deleteMessageConfirmation=useSelector(state=>state.chat.deleteMessageConfirmation);
  
  const deleteForEveryOneEnabler=useSelector(state=>state.chat.deleteForEveryOneEnabler);
  console.log(deleteForEveryOneEnabler)
  const handleDeleteEveryone=()=>{
    dispatch(deleteMessageForEveryOne(selectedMessagesDeletion));
    if(selectedConversationId){
      const participants=cbyId[selectedConversationId].participants.filter(id=>id!==userId);
      console.log("hulean alvarej")
    socket.emit("deleteMessageForEveryOne",{
      conversationId:selectedConversationId,
      participants:participants,
      selectedMessagesDeletion:selectedMessagesDeletion
    })
    }
    selectedMessagesDeletion.forEach(id=>{
       for(const [cid,conv] of Object.entries(chatMeta)){
                      if(cid===selectedConversationId && conv.lastMessageId===id){
                          dispatch(updateLastMessageContent(cid))
                          break;
                      }
        }
    })
    dispatch(updateDeleteMessageConfirmation(false));
    dispatch(updateDeleteMode(false));
    dispatch(clearSelectedMessagesDeletion());
    dispatch(clearDeleteForEveryOneEnabler());
  }
  const handleDeleteForMe=async()=>{
    dispatch(deleteMessageForMe(userId));
    await axios.post('/api/chat/deleteMessageForMe',{
        selectedMessagesDeletion:selectedMessagesDeletion
    })
    console.log("deletebyMe");
    selectedMessagesDeletion.forEach(id=>{
      
       for(const [cid,conv] of Object.entries(chatMeta)){
        console.log(cid+" "+selectedConversationId+" "+ conv.lastMessageId+" "+id);
                      if(cid===selectedConversationId && conv.lastMessageId===id){
                          dispatch(updateLastMessageDeleteForMe({
                            conversationId:cid,
                            userId:userId
                          }))
                          break;
                      }
        }
    })
    dispatch(updateDeleteMessageConfirmation(false));
    dispatch(updateDeleteMode(false));
    dispatch(clearSelectedMessagesDeletion());
    dispatch(clearDeleteForEveryOneEnabler());
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