import axios from 'axios'
export const fetchData=async(id)=>{
      const res= await axios.post('/api/chat/newChat',{
        id:id
      });
      return res.data;      
}
export function formatLastMessageTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  
  const messageDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffDays = Math.floor((today - messageDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
}