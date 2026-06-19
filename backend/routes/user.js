const express=require('express');
const router=express.Router();
const multer=require('multer');
const path=require('path');
const{handleSignin,handleSignup,handleProfile,handleLastseen}=require('../controllers/user');

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        return cb(null,path.resolve("./public/profileImages/"))
    },
    filename:function(req,file,cb){
        return cb(null,`${Date.now()}-${file.originalname.replace(/\s/g,'-')}`)
    }
})
const upload=multer({storage:storage})
router.post('/signin',handleSignin);
router.post('/signup',upload?.single('profileImage'),handleSignup);
router.get('/getProfile',handleProfile);
router.get('/logout',async(req,res)=>{
    res.clearCookie('token');
    res.status(200).end();
})
router.get('/lastseen/:selectedUserId',handleLastseen)
module.exports=router;