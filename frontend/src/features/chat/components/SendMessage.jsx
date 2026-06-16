import React from 'react'
import SendFile from './SendFile'
import MessageButton from './MessageButton'
import { useState } from 'react'
function SendMessage() {
  const[textMsg,settextMsg]=useState("");

  return (
    <>
    <div className=' w-full h-[8%] p-2 justify-center items-center  flex mt-4'>
        <div className=' w-[90%] h-10 rounded-full flex bg-[#161717]'>
            <SendFile/>
            <input type='text' className='ml-[4px] rounded-full bg-[#161717] h-[100%] w-[92%] outline-none focus:outline-none focus:ring-0' 
            value={textMsg}
            onChange={e=>settextMsg(e.target.value)}
            ></input>
            <MessageButton message={textMsg}/>
        </div>
    </div>
    </>
  )
}

export default SendMessage