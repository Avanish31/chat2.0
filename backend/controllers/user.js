const User=require('../models/user');
const {createToken}=require('../services/auth');
const {validateToken}=require('../services/auth');
async function handleSignin(req,res){
    const {email,password}=req.body;
    const user=await User.findOne({email:email});
    if(!user){
        return res.status(404).json({
            error:"Invalid email"
        });
    }
    const validation=await User.matchPassword(email,password);
    if(!validation){
       return res.status(401).json({
            error:"Invalid password"
       })
    }
    const token=createToken(user);
    res.cookie('token',token);
    return res.status(200).json({
        name:user.name,
        id:user._id
    });
}

async function handleSignup(req,res){
   try{
    await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
    })
    if(req.file?.filename){
        User.profileImage=`/profileImages/${req.file.filename}`
    }
    return res.status(200).end();
}
catch(error){
    if(error.code===11000){
        const fieldValue=Object.values(error.keyValue)[0];
        return res.status(409).json({
            error:`${fieldValue} already exists`
        })
    }
}
    
}
async function handleProfile(req,res){
    const token=req.cookies?.token;
    if(!token){
        return res.status(401).end();
    }
    try{
    const data=validateToken(token);
    return res.status(200).json({
        name:data.name,
        email:data.email
    })
    }catch(err){
        return res.status(401).json({error:"Invalid Token"})
    }
    

}
async function handleLastseen(req,res){
    const id=req.params.selectedUserId
    const data=await User.findOne({
        _id:id
    })
    return res.status(200).json({
        lastseen:data.lastseen
    })

}
module.exports={
    handleProfile,
    handleSignin,
    handleSignup,
    handleLastseen
}