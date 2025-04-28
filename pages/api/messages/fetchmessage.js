import dbConnect from "@/lib/mongodb";
import MessageSchema from "@/models/message";
const handler = async (req,res)=>{
    try{

        await dbConnect();
        const {conversationID} = req.query;
    
        const getMessages = async (conversationID) => {
            
            const messages = await MessageSchema.find({conversationID:conversationID})
        
            return messages;
            
        };

        const messages = await getMessages(conversationID);
        

        if (messages && messages.length > 0) {
            res.status(200).json({ messages });
        } else {
            console.log(messages);
            res.status(404).json({ error: 'Messages not found' });
        }

       
    }catch (error){
        res.status(500).json({error:error});
       
       
    }
}
export default handler;