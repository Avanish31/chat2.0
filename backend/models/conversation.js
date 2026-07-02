const {Schema,model}=require('mongoose');
const conversationSchema=new Schema({
    participants:[{
        type:Schema.Types.ObjectId,
        ref:'user'
    }],
    lastMessage:{
        type:String,
        required:true
    },
    blocked:{
        type:Map,
        of:Boolean,
        default:{}
    },
    deletedUntil: {
        type: Map,
        of: Date,
        default: {}
    },
    lastSeenMessage:{
        type:Map,
        of:{
            type:Schema.Types.ObjectId,
            ref:"message"
        },
        default: {}
    },
    lastMessageTime:{
        type:String
    },
    conversationType:{
        type:String
    },
    groupName:{
        type:String,
    },
    groupProfilePhoto:{
        type:String
    },
    groupEmail:{
        type:String,
    }

},{timestamps:true})
conversationSchema.index(
    { groupEmail: 1 },
    {
        unique: true,
        partialFilterExpression: {
            groupEmail: {
                $exists: true,
                $type: "string"
            }
        }
    }
);
conversationSchema.pre("save", async function () {
    if (this.isNew) {
        this.participants.forEach(id => {
            const key = id.toString();

            if (!this.blocked.has(key))
                this.blocked.set(key, false);

            if (!this.deletedUntil.has(key))
                this.deletedUntil.set(key, null);

            if (!this.lastSeenMessage.has(key))
                this.lastSeenMessage.set(key, null);
        });
    }
});
const Conversation=model('conversation',conversationSchema);

module.exports=Conversation;