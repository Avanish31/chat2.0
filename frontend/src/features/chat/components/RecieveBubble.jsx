import React from 'react'

function RecieveBubble({message,messageType,time}) {
  return (
    <div className='w-full flex justify-start mt-2 mb-2 ml-2'>
      <div className=' p-1 mr-1 min-w-[50px] max-w-[50%] rounded-[10px] flex flex-wrap break-all justify-center bg-blue-600'>
        {message}
         <div className='w-full flex justify-end mt-1'>
          <span className='text-[10px] text-gray-200'>
            {time}
          </span>
      </div>
      </div>
    </div>
  )
}

export default RecieveBubble