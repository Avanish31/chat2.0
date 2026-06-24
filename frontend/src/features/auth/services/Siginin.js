import axios from "axios";
import { connectSocket } from "../../../socket/socketClient";
export async function Signinfn(data,setError,reset,dispatch,login,navigate){
    
    setError("");
    try{
        const res=await axios.post("/api/user/signin",data);
        const name=res.data.name
        console.log(res.data.id);
        dispatch(login({
            userData:{
                name:name,
                email:data.email,
                id:res.data.id
            }
        }))
        console.log("loggin sucern");
        navigate('/');
        reset();

    }catch(err){
        setError(err.response.data.error);
    }
}