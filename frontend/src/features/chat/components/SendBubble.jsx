import React from 'react'

function SendBubble({message,messageType}) {
  return (
    <div className=' w-full flex justify-end mb-2 mt-2'>
      <div className=' p-1 mr-1 min-w-[50px] max-w-[50%] rounded-[10px] flex flex-wrap break-all justify-center bg-gray-600'>
       {message}
      </div>
    </div>
  )
}

export default SendBubble