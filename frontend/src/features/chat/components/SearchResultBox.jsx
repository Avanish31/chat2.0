import React from 'react'
import ChatCard from './ChatCard'
import { useSelector } from 'react-redux'
function SearchResultBox({searchResult,email}) {
  
  return (
    <div className=' w-full p-2 text-white flex justify-center'>
      {email?searchResult?<ChatCard name={searchResult.name} profileImage={searchResult.profileImage} id={searchResult.id}/ >:'No user found':'Search your friend'}
      
    </div>
  )
}

export default SearchResultBox