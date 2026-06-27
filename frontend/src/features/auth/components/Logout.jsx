import { useDispatch } from 'react-redux'
import { logout } from '../state/authSlice'
import Logoutfn from '../services/Logout'
import { disconnectSocket ,} from '../../../socket/socketClient';
import { resetSocketInit } from '../../../socket/socketEvent';
function Logout() {
    const dispatch=useDispatch();
    const logoutHandler=()=>{
        Logoutfn(dispatch,logout)
        disconnectSocket();
        resetSocketInit();
    }
  return (
    <>
    <button className='text-white' onClick={logoutHandler}>
        Logout
    </button>
    </>
  )
}

export default Logout