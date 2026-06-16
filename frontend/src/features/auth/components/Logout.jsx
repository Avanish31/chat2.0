import { useDispatch } from 'react-redux'
import { logout } from '../state/authSlice'
import Logoutfn from '../services/Logout'
import { disconnectSocket } from '../../../socket/socketClient';
function Logout() {
    const dispatch=useDispatch();
    const logoutHandler=()=>{
        Logoutfn(dispatch,logout)
        disconnectSocket();
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