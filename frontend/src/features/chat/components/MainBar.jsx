import React, { useEffect, useState } from 'react'
import { useParams,useSearchParams } from 'react-router-dom'
import LastSeen from './LastSeen'
import Block from './Block'
import DeleteChat from './DeleteChat'
import ChatWindow from './ChatWindow'
import SendMessage from './SendMessage'
import {useSelector} from 'react-redux'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import {fetchData} from '../services/newChatHandle'
import { addPresence, setSelectedUserId,setMessages ,setSelectedConversationType,setSelectedConversationId,clearUnreadCount} from '../state/chat'
import { getSocket } from '../../../socket/socketClient'
function MainBar() {
  const [conv,setConv]=useState(null);
  const {id}=useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const dispatch=useDispatch();
  const friends=useSelector(state=>state.chat.friends);
  const userData=useSelector((state)=>state.auth.userData);
  const userId=userData?.id;
  const conversations=useSelector(state=>state.chat.conversations);
  const conversationId=useSelector(state=>state.chat.selectedConversationId)
  const chatMeta=useSelector(state=>state.chat.chatMeta);
  console.log("yeag "+conversationId)
  const cbyId=conversations.byId;
  const fbyId=friends.byId;
 useEffect(() => {
  console.log("inside useffect");
  dispatch(setSelectedUserId(id));
  dispatch(setSelectedConversationType(type));
  console.log(friends);
  if(fbyId[id] && type=="dm"){
    dispatch(setSelectedConversationId(fbyId[id]?.conversationId));
    setConv({
      name:fbyId[id].name,
      profileImage:fbyId[id].profileImage
    });
  }
  else if(cbyId[id] && type=="group"){
    dispatch(setSelectedConversationId(id));
    setConv({
      name:cbyId[id].groupName,
      profileImage:cbyId[id].groupProfilePhoto
    });
  }
  else{
  dispatch(setSelectedConversationId(null));
  const loadUser = async () => {
    if (id && type=="dm") {
      console.log("inside loadUser");
      const data = await fetchData(id);
      console.log(data);
      setConv(data); 
    }
  };
  loadUser();
}
  const loadRealTimeData=async()=>{
    const res=await axios.get(`/api/chat/status/${id}`);
    if(res.data.status){
      dispatch(addPresence({
        id:id,
        status:true,
        lastseen:null
      }))
    }
    else{
      await axios.get(`/api/user/lastseen/${id}`).then((res)=>{
          dispatch(addPresence({
              id:id,
              status:false,
              lastseen:res.data.lastseen
          }))
      })
    }
  }
  if(type=="dm"){
  loadRealTimeData();
  }
}, [id,friends,conversations,dispatch]);
console.log(conversationId);
useEffect(() => {
    if (conversationId) {
        axios
            .get(`/api/chat/getMessages/${conversationId}?id=${id}&type=${type}`)
            .then(res => {
                dispatch(setMessages(res.data.messages));
            });
    } else {
        dispatch(setMessages([]));
    }
   
}, [friends,conversations,conversationId]);
useEffect(() => {
    if (!conversationId) return;

    if (!chatMeta[conversationId]) return;

    const socket = getSocket();
    const participants=conversations.byId[conversationId].participants.filter(id=>id!==userId);
    socket.emit("openedConv", {
        conversationId,
        conversationType: type,
        participants:participants
    });

    dispatch(clearUnreadCount(conversationId));
}, [conversationId, chatMeta, type]);
useEffect(() => {
    return () => {
      dispatch(setSelectedConversationId(null));
      dispatch(setSelectedConversationType(null));
      dispatch(setSelectedUserId(null));
    };
  }, []);
const presence=useSelector(state=>state.chat.presence);
const lastseen=presence[id]?.lastseen;
const status=presence[id]?.status;
  return (
    <div className='w-[65%] h-screen text-white bg-[#0B141A] flex flex-col'>
      {(conv)?(
        <>
      <div className='w-full h-[10%]  bg-[#161717] border-b border-b-blue-400  flex '>
        <div className=' w-[60%] flex items-center gap-2 '>
          <img className="w-16 h-16 rounded-full" src={conv.profileImage}/>
          <div className='flex flex-col justify-center'>
            <p>{conv.name}</p>
            
          {type=="dm" && !status&& lastseen?<>{lastseen}</>:null}
          </div>
        </div>
        <div className=' w-[40%] flex items-center justify-evenly  '>
         {
            type === "dm" ? (
              <>
                {status ? (
                  <img className="w-8 h-8 rounded-full" src="/images/online.png" />
                ) : (
                  <img className="w-8 h-8 rounded-full" src="/images/offline.png" />
                )}
                <Block />
              </>
            ) : null
          }
           <DeleteChat />
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