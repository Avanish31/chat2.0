import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import SearchWindow from './SearchWindow';
import ChatCard from './ChatCard';
import SearchResultBox from './SearchResultBox';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { clearSelectedForwardConversations, clearSelectedForwardMessages, setSearchResult, updateForwardConversationSelectionMode,updateForwardMode } from '../state/chat';
import { formatLastMessageTime } from '../services/newChatHandle';
import ForwardButton from './ForwardButton';
import { Forward } from 'lucide-react';
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
  const len=useSelector(state=>state.chat.forwardSelectedConversations)?.length;
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
    let lastMessage=conv.lastMessage;
      if(lastMessage?.length>20){
        lastMessage=lastMessage?.slice(0,15)+".....";
      }
    
    if(conversation?.type==="dm"){
      const participants=conversation.participants;
      console.log(participants);
      friendsId = participants.find(id => id !== userId);
      console.log(friendsId);
      console.log(byId);
      console.log(byId[friendsId]);
      console.log("convId",conv)
      return {
        name:byId[friendsId].name,
        profileImage:byId[friendsId].profileImage,
        lastMessage:lastMessage,
        unreadCount:conv.unreadCount,
        lastMessageStatus:conv.lastMessageStatus,
        lastSenderId:conv.lastSenderId,
        lastMessageTime:conv.lastMessageTime!=null?formatLastMessageTime(conv.lastMessageTime):conv.lastMessageTime,
        lastMessageWaitStatus:conv?.lastMessageWaitStatus ?? false,
        id:friendsId,
        convId:conv?.id,
        type:"dm",
        isTyping:conv.isTyping
      }
    }
    else if(conversation?.type==="group"){
        return{
          name:conversation.groupName,
          profileImage:conversation.groupProfilePhoto,
          lastMessage:lastMessage,
          unreadCount:conv.unreadCount,
          lastMessageStatus:conv.lastMessageStatus,
          lastSenderId:conv.lastSenderId,
          lastMessageTime:formatLastMessageTime(conv.lastMessageTime),
          lastMessageWaitStatus:conv?.lastMessageWaitStatus ?? false,
          id:conv.id,
          convId:conv?.id,
          type:"group",
          isTyping:conv.isTyping
        }
    }
  })
  const dummyChats = Array.from({ length: 30 }, (_, i) => ({
  id: `dummy-${i + 1}`,
  name: `Dummy User ${i + 1}`,
  profileImage: "/images/default-avatar.png",
  lastMessage: `This is a test message ${i + 1}`,
  unreadCount: 0,
  lastMessageStatus: true,
  lastSenderId: userId,
  lastMessageTime: "Yesterday",
  lastMessageWaitStatus: false,
  type: "dm",
  isTyping: false,
}));

const testChats = [...formatted, ...dummyChats];
  console.log(formatted);
  const forwardConversationSelectionMode=useSelector(state=>state.chat.forwardConversationSelectionMode);
  return (
  <div className="relative min-w-[350px] w-[35%] h-screen bg-[#161717] border-r-[0.25px]">

    {/* Sidebar header */}
    <div className="flex items-center justify-around w-full mb-4">
      <Link to="/">
        <img className="w-28" src="/images/logo.png" alt="Logo" />
      </Link>

      <SearchWindow
        query={query}
        setQuery={setQuery}
        onFocus={() => setIsSearching(true)}
      />
    </div>

    {!forwardConversationSelectionMode && query && (
      <SearchResultBox
        query={query}
        searchResult={searchResult}
      />
    )}

    {/* Scrollable chat list */}
    <div className="h-[calc(100%-120px)] overflow-y-auto hide-scrollbar">
      {formatted.length !== 0 &&
        formatted.map((conv) => (
          <ChatCard
            name={conv.name}
            profileImage={conv.profileImage}
            lastMessage={conv.lastMessage}
            unreadCount={conv.unreadCount}
            lastMessageStatus={conv.lastMessageStatus}
            lastSenderId={conv.lastSenderId}
            lastMessageTime={conv.lastMessageTime}
            lastMessageWaitStatus={conv.lastMessageWaitStatus}
            type={conv.type}
            id={conv.id}
            convId={conv.convId}
            key={conv.id}
            isTyping={conv.isTyping}
          />
        ))}
    </div>

    {/* Fixed-position box inside sidebar */}
    {forwardConversationSelectionMode==true?<div className=" flex justify-between items-center absolute bottom-4 left-1/2 -translate-x-1/2 z-20
                    w-[90%] h-12 rounded-xl bg-[#35383d]
                    shadow-lg p-2">
    <div className='flex gap-3 text-[20px] items-center text-white '>
    <button onClick={()=>{dispatch(updateForwardConversationSelectionMode(false)); dispatch(updateForwardMode(false)); dispatch(clearSelectedForwardConversations()); dispatch(clearSelectedForwardMessages());}}>
    <img src='/images/cross.png' className='h-4 w-4'></img>
    </button>
    <span>{len}</span>
    </div>
    <ForwardButton/>
   
    </div>:undefined}

  </div>
);
}

export default SideBar