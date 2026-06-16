const {Schema,model}=require('mongoose');
const bcrypt=require('bcrypt');
const userSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    profileImage:{
        type:String,
        default:'/images/defaultprofile.png'
    },
    lastseen:{
        type:String,
    }
})
userSchema.pre('save',async function(){
    const user=this;
    if(!user.isModified('password')){
        return;
    }
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
})
userSchema.static('matchPassword',async function(email,password){
    const user=await this.findOne({email:email});
    const match=await bcrypt.compare(password,user.password);
    return match;
})
const User=model('user',userSchema);
module.exports=User;