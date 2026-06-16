import axios from "axios";

export async function Signupfn(data,setError,reset,navigate){
    
    setError("");
    try{
        const formData=new FormData();
        formData.append("name", data.name)
        formData.append("email", data.email)
        formData.append("password", data.password)
        if (data.profileImage[0]) {
        formData.append("profileImage", data.profileImage[0])
      }
      const res=await axios.post("/api/user/signup",formData,{
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      reset();
      navigate('/signin');
    }catch(err){
        setError(err.response.data.error);
    }
}