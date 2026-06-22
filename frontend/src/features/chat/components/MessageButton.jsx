import React from 'react'
import { useDispatch ,useSelector} from 'react-redux'
import { addMessages } from '../state/chat';

function MessageButton({message}) {
  const dispatch=useDispatch();
  const receiverId=useSelector(state=>state.chat.selectedUserId);
  const friends=useSelector(state=>state.chat.friends);
  const byId=friends.byId;
  const conversationId=byId[receiverId]?.conversationId;
  console.log(conversationId);
  const user=useSelector(state=>state.auth.userData);

  console.log(user);
  const senderId=user?.id;
  
  const sendMessage=()=>{
    dispatch(addMessages({
    conversationId:conversationId,
    senderId:senderId,
    receiverId:receiverId,
    message:message,
    messageType:"text",
    }))
  }
  return (
    <button>
        <img className='w-8 h-8 ' src='/images/send.png' onClick={sendMessage}/>
    </button>
  )
}

export default MessageButton