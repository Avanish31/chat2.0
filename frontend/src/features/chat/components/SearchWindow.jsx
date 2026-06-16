import React from 'react'
import SearchWindowButton from './SearchWindowButton'
import { useState } from 'react'
import { useSelector } from 'react-redux';
import SearchResultBox from './SearchResultBox';
function SearchWindow({onFocus,email,setEmail}) {

  return (
    <>
    <div className='w-[65%]  rounded-[10px] h-[30px] text-white bg-gray-600
             border-[5px] border-gray-600
             focus:border-blue-800 flex'>
    <input type='text' className='w-[90%] bg-gray-600 outline-none
        focus:outline-none'
        onFocus={onFocus}
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        />

<SearchWindowButton email={email}/>

</div>
    </>
  )
}

export default SearchWindow