import User from '@/models/user.js';
import dbConnect from '@/lib/mongodb';
const handler = async (req,res)=>{
    try{
        await dbConnect();
      
            const {userUID} = req.query;
            let user = await User.findOne({firebaseUid:userUID});
            if(user){
               return  res.status(200).json({user});

            }else{
                return res.status(404).json({error:"User not found"});
            }
    }catch(err){
        return res.status(500).json({error:err});
    }
}

export default handler;