import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import SearchWindow from './SearchWindow';
import ChatCard from './ChatCard';
import SearchResultBox from './SearchResultBox';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setSearchResult } from '../state/chat';
function SideBar() {
  const [isSearching,setIsSearching]=useState(false);
  
  const friends=useSelector(state=>state.chat.friends);
  const byId=friends.byId;
  const allIds=friends.allIds;
  const chatMeta=useSelector(state=>state.chat.chatMeta);
  const sortedChatMeta = Object.entries(chatMeta)
  .map(([userId, data]) => ({
    userId,
    ...data
  }))
  .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
  const searchResult=useSelector(state=>state.chat.searchResult);
  
  const [email,setEmail]=useState("");
  const dispatch=useDispatch();
  useEffect(()=>{
    if(!email){
      dispatch(setSearchResult(null));
    }
  },[email])
  return (
    <>
    <div className=' min-w-[350px] w-[35%] flex flex-col items-center bg-[#161717] min-h-screen border-r-[0.25px]'>
    <div className='flex  items-center place-content-around  w-full mb-4'>
    <Link to="/"><img className="w-28"src="/images/logo.png"/></Link>
    <SearchWindow
      email={email}
      setEmail={setEmail}
      onFocus={() => setIsSearching(true)}
    />
    </div>
   {email && (
  <SearchResultBox email={email} searchResult={searchResult} />
)}
    
    <div className='w-full overflow-y-auto '>
    {sortedChatMeta.map(user=>(
      <ChatCard 
      name={byId[user.userId].name}
      profileImage={byId[user.userId].profileImage}
      lastMessage={user.lastMessage}
      unreadCount={user.unreadCount}
      id={user.userId}
      key={user.userId}
      />
    ))}
    </div>
    
    
    
    </div>
    </>
  )
}

export default SideBar