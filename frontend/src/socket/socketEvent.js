import { getSocket } from "./socketClient";
import { useSelector} from "react-redux";
import { setRealTimeData } from "../features/chat/state/chat";

export function initSocket(socket,selectedUserId,dispatch){
if(!socket){
    return;
}
console.log('inisde socket');
socket.on('userOnline',async(data)=>{
    if( selectedUserId && data.userId==selectedUserId){
        console.log(data.userId+" came online")
        dispatch(setRealTimeData({
            status:true,
            lastseen:null,
        }))
    }
})

socket.on('userOffline',async(data)=>{
    if(selectedUserId && data.userId==selectedUserId){
        console.log(data.userId+" went offline");
        dispatch(setRealTimeData({
            status:false,
            lastseen:data.lastseen
        }));
    }
})
}