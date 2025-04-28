// Your handler file
import dbConnect from '@/lib/mongodb';
// import getMessageModel from '../../Models.js/getMessageModel';
import MessageSchema from '@/models/message.js';

const handler = async (req, res) => {
    await dbConnect();
    if (req.method === "POST") {
        const { conversationID, userUID, sender, content, file, type, messageTime,viewMore} = req.body;

        try {
            const message = new MessageSchema({
                userUID:userUID,
                conversationID:conversationID,
                sender: sender,
                content: content,
                file:file,
                type:type,
                messageTime:messageTime,
                viewMore:viewMore
            });

            await message.save();
            res.status(200).json({ message });
        } catch (error) {
            console.error('Error saving message:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(400).json({ error: "This method is not allowed" });
    }
}

export default handler;
