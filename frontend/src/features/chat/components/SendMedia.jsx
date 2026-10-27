import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSocket } from '../../../socket/socketClient';
import sendMediaHelper from '../services/sendMediaHelper';
function SendMedia() {
  const dispatch=useDispatch();
  const selectedMedia=useSelector(state=>state.media.selectedMedia);
  const byId=selectedMedia.byId;
  const allIds=selectedMedia.allIds;
  const conversationId=useSelector(state=>state.chat.selectedConversationId);
  const selectedUserId=useSelector(state=>state.chat.selectedUserId);
  let receiverId=[selectedUserId];
  const user=useSelector(state=>state.auth.userData);
  const senderId=user?.id;
  const conversations=useSelector(state=>state.chat.conversations);
  const conversationType=useSelector(state=>state.chat.selectedConversationType);
  if(conversations[selectedUserId] && conversationType=="group"){
        const participants=conversations[selectedUserId].participants;
        receiverId=participants.filter(id=>id!=senderId);
  }
  
  const socket=getSocket();
const handleUpload = async () => {
    await sendMediaHelper({
        allIds,
        byId,
        dispatch,
        conversationId,
        senderId,
        receiverId,
        conversationType,
        socket
    });
};
  return (
    <button className='h-8 w-8 absolute right-2' onClick={handleUpload}>
            <img src='/images/send.png' />
    </button>
  )
}

export default SendMedia