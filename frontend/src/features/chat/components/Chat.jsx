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
import Snackbar from '../../../partials/SnackBar'
import { updateMediaError } from '../state/media'
import Viewer from './Viewer'
function Chat() {
  const dispatch=useDispatch();
  const navigate=useNavigate();
  const selectedConversationId=useSelector(state=>state.chat.selectedConversationId);
  const conversations=useSelector(state=>state.chat.conversations);
  const userData=useSelector(state=>state.auth.userData);
  const chatMeta=useSelector(state=>state.chat.chatMeta);
  const selectedMessagesDeletion=useSelector(state=>state.chat.selectedMessagesDeletion);
  const mediaStore=useSelector(state=>state.media.MediaStore);
  const messages=useSelector(state=>state.chat.messages);
  const userId=userData?.id;
  const cbyId=conversations.byId;
  const socket=getSocket();
  const mediaError=useSelector(state=>state.media.mediaError);
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
      let category=null;
      messages.forEach((msg)=>{
        console.log('better')
        if(msg._id==id && msg.messageType=="media" ){
            category=mediaStore.byId[msg.message].category;
            
        }
      })
       for(const [cid,conv] of Object.entries(chatMeta)){
        console.log(cid+" "+selectedConversationId+" "+ conv.lastMessageId+" "+id);
                      if(cid===selectedConversationId && conv.lastMessageId===id){
                          dispatch(updateLastMessageDeleteForMe({
                            conversationId:cid,
                            userId:userId,
                            category:category
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
  const showError=useSelector(state=>state.media.showError);
  const showMediaFull=useSelector(state=>state.media.showMediaFull);
  return (
    <>
    <div className='w-full flex h-screen overflow-hidden'>
    <SideBar/>
    <MainBar/>
    {deleteMessageConfirmation && <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="h-40 w-80  bg-[#161717] rounded-lg shadow-lg  text-white flex flex-col ">
        {deleteForEveryOneEnabler==0?<button className='flex pl-4 flex-1  hover:bg-[rgb(61,59,59)] items-center rounded-md' onClick={handleDeleteEveryone}>Delete for everyone </button>:null}
        <button className='flex flex-1 pl-4  hover:bg-[rgb(61,59,59)] items-center rounded-md' onClick={handleDeleteForMe}>Delete for me</button>
        <button className='flex  flex-1 pl-4  hover:bg-[rgb(61,59,59)] items-center rounded-md'onClick={handleCancel}>Cancel</button>
      </div>    
   </div>}
   {mediaError?.active==true && <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
        <div className="relative bg-[#161717] rounded-lg p-5 w-[350px] min-h-[150px] shadow-lg"> 
          <div className="text-white text-center"> 
            {mediaError.message}
             </div> 
             <button onClick={()=>{
              dispatch(updateMediaError({
                mediaId:null,
                active:false,
                message:null
              }))
             }} className="absolute bottom-3 right-4 px-3 py-1 bg-blue-600 text-white rounded-md" > Close </button> </div>
   </div>}
   {showMediaFull?.active==true && <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
       <Viewer mediaId={showMediaFull.mediaId}/>
   </div>}
      {showError&&<Snackbar message={showError}/>}
    </div>
   
    </>
  )
}

export default Chat