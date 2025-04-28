// MessageSchema.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    userUID:{type:String},
    conversationID: { type: String },
    sender: { type: String },
    content: { type: String },
    file:{type:String},
    type:{type:String},
    messageTime:{type:Date}
    
}, { timestamps: true });

module.exports =  mongoose.models.Message || mongoose.model('Message',MessageSchema);
