import { useNavigate } from "react-router-dom"
import { chatAuth } from "../services/chatAuth"
import { useDispatch,useSelector } from 'react-redux';
function ChatLink() {
    const navigate=useNavigate();
    const userData=useSelector(state=>state.auth.userData);
    const chatHandler=()=>{
      navigate('/chat');
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