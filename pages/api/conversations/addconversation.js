// Your handler file
import dbConnect from '@/lib/mongodb';
// import getMessageModel from '../../Models.js/getMessageModel';
import Conversation from '@/models/conversation';

const handler = async (req, res) => {
    await dbConnect();
    if(req.method !== 'POST') return console.error("error in the method");
    if (req.method === "POST") {
        const {userUID, language, title} = req.body;

        try {
            const conversation = new Conversation({
                userUID:userUID,
                language:language,
                title: title,
                timestamp: new Date(),
            });

            await conversation.save();
            res.status(200).json({ conversation });
        } catch (error) {
            console.error('Error saving conversation:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(400).json({ error: "This method is not allowed" });
    }
}

export default handler;
