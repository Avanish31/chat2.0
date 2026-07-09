import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import SearchWindow from './SearchWindow';
import ChatCard from './ChatCard';
import SearchResultBox from './SearchResultBox';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setSearchResult } from '../state/chat';
import { formatLastMessageTime } from '../services/newChatHandle';
function SideBar() {
  const [isSearching,setIsSearching]=useState(false);
  const userData=useSelector((state)=>state.auth.userData);
  const userId=userData?.id;
  const friends=useSelector(state=>state.chat.friends);
  const byId=friends.byId;
  const allIds=friends.allIds;
  const chatMeta=useSelector(state=>state.chat.chatMeta);
  const sortedChatMeta = Object.entries(chatMeta)
  .map(([id, data]) => ({
    id,
    ...data
  }))
  .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
  const searchResult=useSelector(state=>state.chat.searchResult);
  const conversations=useSelector(state=>state.chat.conversations);
  const cbyId=conversations.byId;
  console.log(cbyId);
  console.log(conversations);
  const [query,setQuery]=useState("");
  const dispatch=useDispatch();
  useEffect(()=>{
    if(!query){
      dispatch(setSearchResult(null));
    }
  },[query])
  let formatted=[];
  console.log(sortedChatMeta);
    formatted=sortedChatMeta.map(conv=>{
    let friendsId=null
    let conversation=cbyId[conv.id];
    console.log(conversation);
    if(conversation?.type==="dm"){
      const participants=conversation.participants;
      console.log(participants);
      friendsId = participants.find(id => id !== userId);
      console.log(friendsId);
      console.log(byId);
      console.log(byId[friendsId]);
      return {
        name:byId[friendsId].name,
        profileImage:byId[friendsId].profileImage,
        lastMessage:conv.lastMessage,
        unreadCount:conv.unreadCount,
        lastMessageStatus:conv.lastMessageStatus,
        lastSenderId:conv.lastSenderId,
        lastMessageTime:formatLastMessageTime(conv.lastMessageTime),
        id:friendsId,
        type:"dm",
        isTyping:conv.isTyping
      }
    }
    else if(conversation?.type==="group"){
        return{
          name:conversation.groupName,
          profileImage:conversation.groupProfilePhoto,
          lastMessage:conv.lastMessage,
          unreadCount:conv.unreadCount,
          lastMessageStatus:conv.lastMessageStatus,
          lastSenderId:conv.lastSenderId,
          lastMessageTime:formatLastMessageTime(conv.lastMessageTime),
          id:conv.id,
          type:"group",
          isTyping:conv.isTyping
        }
    }
  })

  console.log(formatted);
  return (
    <>
    <div className=' min-w-[350px] w-[35%] flex flex-col items-center bg-[#161717] min-h-screen border-r-[0.25px]'>
    <div className='flex  items-center place-content-around  w-full mb-4'>
    <Link to="/"><img className="w-28"src="/images/logo.png"/></Link>
    <SearchWindow
      query={query}
      setQuery={setQuery}
      onFocus={() => setIsSearching(true)}
    />
    </div>
   {query && (
  <SearchResultBox query={query} searchResult={searchResult} />
)}
    
    <div className='w-full overflow-y-auto '>
    {formatted.length!=0 && formatted.map(conv=>(
      <ChatCard 
      name={conv.name}
      profileImage={conv.profileImage}
      lastMessage={conv.lastMessage}
      unreadCount={conv.unreadCount}
      lastMessageStatus={conv.lastMessageStatus}
      lastSenderId={conv.lastSenderId}
      lastMessageTime={conv.lastMessageTime}
      type={conv.type}
      id={conv.id}
      key={conv.id}
      isTyping={conv.isTyping}
      />
    ))}
    </div>
    
    
    
    </div>
    </>
  )
}

export default SideBar