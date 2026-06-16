import { useNavigate } from "react-router-dom"
import { chatAuth } from "../services/chatAuth"
import { useDispatch } from 'react-redux';
function ChatLink() {
    const navigate=useNavigate();
    const chatHandler=()=>{
        chatAuth(navigate,useDispatch);
    }
  return (
    <>
    <button className='text-white' onClick={chatHandler}>
        Chat
    </button>
    </>
  )
}

export default ChatLink