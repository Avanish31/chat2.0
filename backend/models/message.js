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
    messageTime:{
        type:String,
        require:true
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
    }

},{timestamps:true})
const Messages=model('message',messageSchema);
module.exports=Messages