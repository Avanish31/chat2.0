const {Schema,model}=require('mongoose');
const messageSchema=new Schema({
    conversationId:{
        type:Schema.Types.ObjectId,
        ref:'conversation'
    },
    senderId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    receiverId: [
    {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
    ],
    message:{
        type:String,
        required:true
    },
    messageType:{
        type:String,
        required:true
    },
    sendTime:{
        type:Date,      
    },
    receiveTime:{
        type:Date,
    },
    deleteBy:[
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    deletedForEveryOne:{
        type:Boolean,
        default:false
    },
    dummy:{
        type:Boolean,
        default:false
    },
    visibility:[{
            type:Schema.Types.ObjectId,
            ref:'user'
    }]

},{timestamps:true})
const Messages=model('message',messageSchema);
module.exports=Messages