import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LastSeen from './LastSeen'
import Block from './Block'
import DeleteChat from './DeleteChat'
import ChatWindow from './ChatWindow'
import SendMessage from './SendMessage'
import {useSelector} from 'react-redux'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import {fetchData} from '../services/newChatHandle'
import { setRealTimeData, setSelectedUserId,setMessages } from '../state/chat'
function MainBar() {
  const [user,setUser]=useState(null);
  const {id}=useParams();
  const dispatch=useDispatch();
  const friends=useSelector(state=>state.chat.friends);
  console.log(friends);
 
  const byId=friends.byId;
  const conversationId=byId[id]?.conversationId;
  console.log(conversationId)
 console.log(id);
 useEffect(() => {
  console.log("inside useffect");
  if(!id){
    return;
  }
  else{
    dispatch(setSelectedUserId(id));
  }
  if(byId[id]){
    
    setUser(byId[id]);
  }
  else{
    console.log(id);
  const loadUser = async () => {
    if (id) {
      console.log("inside loadUser");
      const data = await fetchData(id);
      console.log(data);
      setUser(data); 
    }
  };
  loadUser();
}
  const loadRealTimeData=async()=>{
    const res=await axios.get(`/api/chat/status/${id}`);
    if(res.data.status){
      dispatch(setRealTimeData({
        status:true,
        lastseen:null
      }))
    }
    else{
      await axios.get(`/api/user/lastseen/${id}`).then((res)=>{
          dispatch(setRealTimeData({
              status:false,
              lastseen:res.data.lastseen
          }))
      })
    }
  }
  loadRealTimeData();
  const loadMessages=async()=>{
     console.log("conversationId "+conversationId);
    if(conversationId){
      await axios.get(`/api/chat/getMessages/${conversationId}`).then(async(res)=>{
        dispatch(setMessages(res.data.messages));
      });
    }
  }
  loadMessages();

  
}, [id,byId]);
console.log(user?.name);
const realTimeData=useSelector(state=>state.chat.realTimeData);
const lastseen=realTimeData.lastseen;
const status=realTimeData.status;

  return (
    <div className='w-[65%] h-screen text-white bg-[#0B141A] flex flex-col'>
      {(id && user)?(
        <>
      <div className='w-full h-[10%]  bg-[#161717] border-b border-b-blue-400  flex '>
        <div className=' w-[60%] flex items-center gap-2 '>
          <img className="w-16 h-16 rounded-full" src={user.profileImage}/>
          <div className='flex flex-col justify-center'>
            <p>{user.name}</p>
          {!status&& lastseen?<>{lastseen}</>:null}
          </div>
        </div>
        <div className=' w-[40%] flex items-center justify-evenly  '>
          <DeleteChat />
          <Block />
          {status?<img  className='w-8 h-8 rounded-full' src='/images/online.png'/>:<img  className='w-8 h-8 rounded-full' src='/images/offline.png'/>}
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