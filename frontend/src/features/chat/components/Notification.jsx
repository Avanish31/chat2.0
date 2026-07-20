import React from 'react'
import WhiteTickIcon from '../../../assets/whitetick'
import BlueTickIcon from '../../../assets/bluetick';
import { useSelector } from 'react-redux'

function Notification({unreadCount,lastMessage,lastSenderId,lastMessageStatus,isTyping}) {
  const user=useSelector(state=>state.auth.userData);
  const userId=user?.id
  const selectedUserId=useSelector(state=>state.chat.selectedUserId);
  const friends=useSelector(state=>state.chat.friends);
  const blocked=friends?.byId[selectedUserId]?.blockedYou ?? false;
  return (
    <div className='flex text-white items-center'>
      <div className='w-[90%] flex'>
        {!blocked && isTyping?<p className="text-[#25D366] font-medium">typing...</p>:(<><div className=' flex items-center mr-[5px]'>{lastSenderId==userId?<>{lastMessageStatus==true?<BlueTickIcon/>:<WhiteTickIcon/>}</>:null}</div>
        {lastMessage && <p>{lastMessage}</p>}</>)}
      </div>
      {(unreadCount && unreadCount!=0)?
      (<div className='w-9 h-9 rounded-full flex justify-center items-center text-white bg-blue-800'>
       {unreadCount}
      </div>):null
      } 
    </div>
  )
}

export default Notification