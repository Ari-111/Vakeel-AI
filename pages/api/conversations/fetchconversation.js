import dbConnect from "@/lib/mongodb";
import Conversation from "@/models/conversation";
const handler = async (req,res)=>{
    try{

        await dbConnect();
        const {userUID} = req.query;
    
        const getConversations = async (userUID) => {
            
            const conversations = await Conversation.find({userUID:userUID})
        
            return conversations.reverse();
            
        };

        const conversations = await getConversations(userUID);
        

        if (conversations && conversations.length > 0) {
            res.status(200).json({ conversations });
        } else {
            console.log(conversations);
            res.status(404).json({ error: 'Conversations not found' });
        }

       
    }catch (error){
        res.status(500).json({error:error});
        console.log("some error" + error);
       
    }
}
export default handler;