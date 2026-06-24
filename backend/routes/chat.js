const express=require('express');
const router=express.Router();
const {InitialChatLoader,searchHandler,newChatHandler,messageHandler,statusHandler,newFriendHandler}=require('../controllers/chat')
router.get('/',InitialChatLoader);
router.post('/search',searchHandler)
router.post('/newChat',newChatHandler)
router.get('/getMessages/:conversationId',messageHandler);
router.get('/status/:id',statusHandler)
router.get('/newFriendSend/:id',newFriendHandler);
router.get('/newFriendReceive/:id',newFriendHandler);
module.exports=router;