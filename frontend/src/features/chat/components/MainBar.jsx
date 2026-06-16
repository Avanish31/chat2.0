import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LastSeen from './LastSeen'
import Block from './Block'
import Online from './Online'
import DeleteChat from './DeleteChat'
import ChatWindow from './ChatWindow'
import SendMessage from './SendMessage'
import {useSelector} from 'react-redux'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import {fetchData} from '../services/newChatHandle'
import { setSelectedUserId } from '../state/chat'
function MainBar() {
  const [user,setUser]=useState(null);
  const {id}=useParams();
  const dispatch=useDispatch();
  const friends=useSelector(state=>state.chat.friends);
 
  const byId=friends.byId;
 console.log(id);
 useEffect(() => {
  console.log("inside useffect");
  if(!id){
    return;
  }
  if(byId[id]){
    setUser(byId[id]);
  }
  else{
    console.log(id);
  const loadUser = async () => {
    if (id && !user) {
      const data = await fetchData(id);
      console.log(data);
      setUser(data); 
    }
  };
  loadUser();
}
  dispatch(setSelectedUserId(id));
}, [id,byId]);


  return (
    <div className='w-[65%] h-screen text-white bg-[#0B141A] flex flex-col'>
      {(id && user)?(
        <>
      <div className='w-full h-[10%]  bg-[#161717] border-b border-b-blue-400  flex '>
        <div className=' w-[60%] flex items-center gap-2 '>
          <img className="w-16 h-16 rounded-full" src={user.profileImage}/>
          <div className='flex flex-col justify-center'>
            <p>{user.name}</p>
            <LastSeen lastSeen={user.lastSeen} />
          </div>
        </div>
        <div className=' w-[40%] flex items-center justify-evenly  '>
          <DeleteChat />
          <Block />
          <Online />
        </div>
      </div>
      <ChatWindow />
      <SendMessage/>
      </>
      ):(<div className='w-full  font-oswald font-bold text-6xl text-white h-[100%]  flex justify-center items-center'>
          START CHATING
      </div>)}
      
    </div>
  )
}

export default MainBar