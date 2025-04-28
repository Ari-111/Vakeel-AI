import mongoose from 'mongoose';


const conversationSchema = new mongoose.Schema({
  language:{type:String,default:''},
  userUID:{type:String,default:'',required:true},
  timestamp:{type:Date,default:Date.now},
  title:{type:String,default:''}
});

const Conversation = mongoose.models.conversation || mongoose.model('conversation', conversationSchema);

export default Conversation;