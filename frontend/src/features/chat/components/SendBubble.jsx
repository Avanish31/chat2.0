import React from 'react'

function SendBubble({message,messageType,status}) {
  return (
    <div className="w-full flex justify-end mb-2 mt-2">
  <div className="p-1 mr-1 min-w-[50px] max-w-[50%] rounded-[10px] bg-gray-600 break-all">
    <div>{message}</div>

    <div className="flex justify-end mt-1">
      
     {status && status==true?<img src="/images/bluetick.png" className='w-5 h-5' />:<img src="/images/blacktick.png" className='w-5 h-5' />}
    </div>
  </div>
</div>
  )
}

export default SendBubble