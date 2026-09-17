const jwt=require('jsonwebtoken');
const secret=process.env.SECRET
function createToken(user){
    const payload={
        name:user.name,
        email:user.email,
        _id:user._id
    }
    const token=jwt.sign(payload,secret);
    return token;
}
function validateToken(token){
    const user=jwt.verify(token,secret);
    return user;
}
module.exports={
    createToken,
    validateToken
}