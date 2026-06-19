import axios from 'axios'
export default async function Logoutfn(dispatch,logout){
    await axios.get('/api/user/logout')
    dispatch(logout());
   

}