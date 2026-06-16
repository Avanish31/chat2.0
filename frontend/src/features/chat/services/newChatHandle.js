import axios from 'axios'
export const fetchData=async(id)=>{
      const res= await axios.post('/api/chat/newChat',{
        id:id
      });
      return res.data;      
}
 