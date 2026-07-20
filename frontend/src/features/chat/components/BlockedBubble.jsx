import React from 'react'

function BlockedBubble({message}) {
  return (
    <div className=' flex justify-center mt-1 mb-1'>
        <div className='flex h-8 mt-2 mb-2 p-1 bg-[#161717] rounded-md'>
                {message}
        </div>
    </div>
  )
}

export default BlockedBubble