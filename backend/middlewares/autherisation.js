const {validateToken}=require('../services/auth');
async function checkAutherisation(req,res,next){
    const token=req.cookies?.token;
    if(!token){
        return res.status(401).end();
    }
    const user=validateToken(token);
    req.user=user;
    next();
}
module.exports={
    checkAutherisation
}