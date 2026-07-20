import React from 'react'
import { useSelector ,useDispatch} from 'react-redux'
import { getSocket } from '../../../socket/socketClient';
import { addMessages, updateYouBlockstatus } from '../state/chat';
function Block() {
    const friends=useSelector(state=>state.chat.friends);
    const selectedConversationId=useSelector(state=>state.chat.selectedConversationId);
    const selectedUserId=useSelector(state=>state.chat.selectedUserId);
    const blocked=friends?.byId[selectedUserId]?.youBlocked ?? false;
    const userData=useSelector(state=>state.auth.userData);
    const userId=userData?.id
    const socket=getSocket();
    const tempId = crypto.randomUUID();
    const dispatch=useDispatch();
    const handleBlock=()=>{
        let message;
        if(!blocked){
            dispatch(updateYouBlockstatus({
                id:selectedUserId,
                status:true
            }))
            socket.emit('blocked',{
                conversationId:selectedConversationId,
                blockedId:selectedUserId
            })
             message="You blocked this user";
            
        }
        else{
            dispatch(updateYouBlockstatus({
                id:selectedUserId,
                status:false
            }))
            socket.emit('unblocked',{
                conversationId:selectedConversationId,
                blockedId:selectedUserId
            })
            message="You unblocked this user"
        }
        const time = new Date().toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).toLowerCase();
            socket.emit('sendMessage',{
                conversationId:selectedConversationId,
                senderId:userId,
                receiverId:selectedUserId,
                message:message,
                messageType:"text",
                messageTime:time,
                conversationType:"dm",
                tempId:tempId,
                blocked:true,
                dummy:true
            })
            console.log(userId)
            dispatch(addMessages({
                    conversationId:selectedConversationId,
                    senderId:userId,
                    receiverId:selectedUserId,
                    message:"You blocked this user",
                    messageType:"text",
                    messageTime:time,
                    createdAt:new Date().toISOString(),
                    status:false,
                    tempId:tempId,
                    deleteBy:[],
                    deletedForEveryOne:false,
                    dummy:true
            }))
        
    }
  return (

      <button onClick={handleBlock}>
        {!blocked? <img  className='w-8 h-8 rounded-full' src='/images/block.png'/>:<img  className='w-8 h-8 rounded-full' src='/images/unblock.png'/>}
      </button>
  ) 
}

export default Block