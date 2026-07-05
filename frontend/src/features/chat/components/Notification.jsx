import React from 'react'

function Notification({unreadCount,lastMessage}) {
  return (
    <div className='flex text-white items-center'>
      <div className='w-[90%] '>
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