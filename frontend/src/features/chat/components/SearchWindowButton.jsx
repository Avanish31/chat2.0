import React from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import {setSearchResult} from '../state/chat'
function SearchWindowButton({email}) {
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
      console.log(data);
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
     <button onClick={()=>handleSearch(email)}>
        <img className='w-6 h-6' src='/images/search.png'/>
    </button>
  )
}

export default SearchWindowButton