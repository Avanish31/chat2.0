import React from 'react'
import { Link } from 'react-router-dom'
import Notification from './Notification'
import { useNavigate } from 'react-router-dom'
import { useSelector,useDispatch } from 'react-redux'
import { clearSelectedForwardConversations, clearSelectedForwardMessages, clearSelectedMessagesDeletion, setMessages ,setSelectedUserId, updateDeleteMode, updateForwardConversationSelectionMode, updateForwardMode} from '../state/chat'
import { removeSelectedForwardConversations,addSelectedForwardConversations } from '../state/chat'
import axios from 'axios'
function ChatCard({name,profileImage,lastMessage=null,unreadCount=0 ,id=null,type,lastMessageStatus=null,lastSenderId=null,lastMessageTime=null,isTyping=false,lastMessageWaitStatus,convId}) {
  const navigate=useNavigate();
  const dispatch=useDispatch();
  const friends=useSelector(state=>state.chat.friends);
  const conversations=useSelector(state=>state.chat.conversations);
  const forwardConversationSelectionMode=useSelector(state=>state.chat.forwardConversationSelectionMode);
  const forwardSelectedConversations=useSelector(state=>state.chat.forwardSelectedConversations);

  const isSelected=forwardSelectedConversations?.includes(convId);
  const handleChatWindow=async()=>{
  navigate(`/chat/${id}?type=${type}`);
  dispatch(updateForwardConversationSelectionMode(false));
  dispatch(updateForwardMode(false));
  dispatch(clearSelectedForwardConversations(false));
  dispatch(clearSelectedForwardMessages(false));
  dispatch(clearSelectedMessagesDeletion());
  dispatch(updateDeleteMode(false));
  }
  console.log(name+" " +unreadCount);
  let blocked=false;
  if(type=="dm"){
    blocked=friends?.byId[id]?.blockedYou??false
    
  }
  const handleForwardSelection = () => {
    console.log("convId",convId);
    if (isSelected) {
      
      dispatch(removeSelectedForwardConversations(convId));
    } else {
      dispatch(addSelectedForwardConversations(convId));
    }
  };
  return  (
    <div
      className={`w-full flex items-center gap-4 mb-4
        hover:bg-[rgb(61,59,59)] cursor-pointer
        ${forwardConversationSelectionMode && isSelected
          ? 'bg-[rgb(61,59,59)]'
          : ''
        }`}
      onClick={() => {
        if (forwardConversationSelectionMode) {
          handleForwardSelection();
        } else {
          handleChatWindow();
        }
      }}
    >
      {blocked ? (
        <img
          className="w-20 h-20 rounded-full"
          src="/images/blockedProfilePhoto.png"
          alt=""
        />
      ) : (
        <img
          className="w-20 h-20 rounded-full"
          src={profileImage}
          alt=""
        />
      )}

      <div className="flex flex-col w-[90%] text-white text-[20px]">
        <div className="flex">
          <p className="w-[80%]">{name}</p>
          <p>{lastMessageTime != null && lastMessageTime}</p>
        </div>

        <Notification
          unreadCount={unreadCount}
          lastMessageStatus={lastMessageStatus}
          lastSenderId={lastSenderId}
          lastMessage={lastMessage}
          isTyping={isTyping}
          lastMessageWaitStatus={lastMessageWaitStatus}
        />
      </div>

      {forwardConversationSelectionMode && (
        <div className="flex items-center justify-center mr-4 shrink-0">
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            className="w-5 h-5 accent-blue-600 pointer-events-none"
          />
        </div>
      )}
    </div>
  );
}

export default ChatCard