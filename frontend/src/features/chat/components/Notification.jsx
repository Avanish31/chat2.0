import React from 'react'
import WhiteTickIcon from '../../../assets/whitetick'
import BlueTickIcon from '../../../assets/bluetick';
import { useSelector } from 'react-redux'

function Notification({unreadCount,lastMessage,lastSenderId,lastMessageStatus}) {
  const user=useSelector(state=>state.auth.userData);
  const userId=user?.id
  return (
    <div className='flex text-white items-center'>
      <div className='w-[90%] flex'>
        <div className=' flex items-center mr-[5px]'>{lastSenderId==userId?<>{lastMessageStatus?<BlueTickIcon/>:<WhiteTickIcon/>}</>:null}</div>
        {lastMessage && <p>{lastMessage}</p>}
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