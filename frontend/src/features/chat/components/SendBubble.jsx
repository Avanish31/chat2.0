import React from 'react'
import BlueTickIcon from '../../../assets/bluetick'
import WhiteTickIcon from '../../../assets/whitetick'

function SendBubble({message,messageType,status,time}) {
  return (
    <div className="w-full flex justify-end mb-2 mt-2">
  <div className="p-1 mr-1 min-w-[50px] max-w-[50%] rounded-[10px] bg-gray-600 break-all">
    <div>{message}</div>

    <div className="flex justify-end items-center gap-1 mt-1">
      <span className="text-[10px] text-gray-200">
        {time}
      </span>

      {status ? (
        <BlueTickIcon/>
      ) : (
        <WhiteTickIcon/>
      )}
    </div>
  </div>
</div>
  )
}

export default SendBubble