import axios from 'axios'
import { disconnectSocket } from '../../../socket/socketClient';
export default async function Logoutfn(dispatch,logout){
    await axios.get('/api/user/logout')
    dispatch(logout());
    disconnectSocket();

}