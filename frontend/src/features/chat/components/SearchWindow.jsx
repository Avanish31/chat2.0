import React from 'react'
import { useState } from 'react'
import SearchResultBox from './SearchResultBox';
import axios from 'axios'
import { useSelector,useDispatch} from 'react-redux';
import {setSearchResult} from '../state/chat'
function SearchWindow({onFocus,query,setQuery}) {
  const friends=useSelector(state=>state.chat.friends);
  const fbyIds=friends.byId;
  const fallIds=friends.allIds;
  const conversations=useSelector(state=>state.chat.conversations);
  const cbyIds=conversations.byId;
  const callIds=conversations.allIds;
  const chatMeta=useSelector(state=>state.chat.chatMeta);
  const forwardConversationSelectionMode=useSelector(state=>state.chat.forwardConversationSelectionMode);
  const dispatch=useDispatch();
  const handleSearch=async (query)=>{
     const foundFId=fallIds.find(id=>fbyIds[id].email===query);
     const foundGId=callIds.find(id=>cbyIds[id].groupEmail==query);
    if(query && (foundFId || foundGId)){
        if(foundFId){
        const conversationId=fbyIds[foundFId].conversationId
        dispatch(setSearchResult({
          name: fbyIds[foundFId].name,
          profileImage: fbyIds[foundFId].profileImage,
          lastMessage: chatMeta[conversationId]?.lastMessage,
          unreadCount: chatMeta[conversationId]?.unreadCount,
          id:foundFId,
          type:"dm"
        }))
      }
      else{
        dispatch(setSearchResult({
          name: cbyIds[foundGId].groupName,
          profileImage: cbyIds[foundGId].groupProfilePhoto,
          lastMessage: chatMeta[foundGId]?.lastMessage,
          unreadCount: chatMeta[foundGId]?.unreadCount,
          id:foundGId,
          type:"group"
        }))
      }
    }
    else if(query){
      try{
      const res=await axios.post('/api/chat/search',{
            email:query
      });
      const data=res.data;
      
      if(data){
        console.log("dispatch working",data);
        dispatch(setSearchResult({
          name:data.name,
          profileImage:data.profileImage,
          id:data.id,
          type:"dm"
        }))
      }
    }catch(err){
        console.log('no user found');
    }
    }
    
  }
  return (
    <>
    <form className='w-[65%]  rounded-[10px] h-[30px] text-white bg-gray-600
             border-[5px] border-gray-600
             focus:border-blue-800 flex' onSubmit={(e) => {e.preventDefault(); handleSearch(query);}}>
    
    <input type='text' className='w-[90%] bg-gray-600 outline-none
        focus:outline-none'
        disabled={forwardConversationSelectionMode}
        onFocus={onFocus}
        value={query}
        onChange={(e)=>setQuery(e.target.value)}
        
        />

  <button type="submit">
        <img className='w-6 h-6' src='/images/search.png'/>
    </button>

</form>
    </>
  )
}

export default SearchWindow