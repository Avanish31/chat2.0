const express=require('express');
const router=express.Router();
const {InitialChatLoader,searchHandler,newChatHandler,messageHandler,statusHandler}=require('../controllers/chat')
router.get('/',InitialChatLoader);
router.post('/search',searchHandler)
router.post('/newChat',newChatHandler)
router.get('/getMessages/:conversationId',messageHandler);
router.get('/status/:id',statusHandler)
module.exports=router;