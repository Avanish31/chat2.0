import React from 'react'
import { useState } from 'react'
import SearchResultBox from './SearchResultBox';
import axios from 'axios'
import { useSelector,useDispatch} from 'react-redux';
import {setSearchResult} from '../state/chat'
function SearchWindow({onFocus,email,setEmail}) {
  const friends=useSelector(state=>state.chat.friends);
  const byIds=friends.byId;
  const allIds=friends.allIds;
  const chatMeta=useSelector(state=>state.chat.chatMeta);
  const dispatch=useDispatch();
  const handleSearch=async (email)=>{
     const foundId=allIds.find(id=>byIds[id].email===email);
    if(email && foundId){
        dispatch(setSearchResult({
          name: byIds[foundId].name,
          profileImage: byIds[foundId].profileImage,
          lastMessage: chatMeta[foundId]?.lastMessage,
          unreadCount: chatMeta[foundId]?.unreadCount,
          id:foundId
        }))
    }
    else if(email){
      try{
      const res=await axios.post('/api/chat/search',{
            email:email
      });
      const data=res.data;
      
      if(data){
        console.log("dispatch working",data);
        dispatch(setSearchResult({
          name:data.name,
          profileImage:data.profileImage,
          id:data.id
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
             focus:border-blue-800 flex' onSubmit={(e) => {e.preventDefault(); handleSearch(email);}}>
    
    <input type='text' className='w-[90%] bg-gray-600 outline-none
        focus:outline-none'
        onFocus={onFocus}
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        
        />

  <button type="submit">
        <img className='w-6 h-6' src='/images/search.png'/>
    </button>

</form>
    </>
  )
}

export default SearchWindow