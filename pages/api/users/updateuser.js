import User from "@/models/user";
import dbConnect from '@/lib/mongodb';
const handler = async (req,res)=>{
    try{
        await dbConnect();
    
           
            if(req.method === "POST"){
                const {userUID,newData} = req.body;
                console.log('useruid', userUID);
               // if(sessionID){
                   
                    let updatedUser = await User.findOneAndUpdate({firebaseUid:userUID},{$push:{conversations:newData}},{new:true});
                    if(!updatedUser){
                        res.status(404).json({message:"User not found"});
                    }
                    
                    res.status(200).json({ success: "success", user: updatedUser });
                // }else{
                //     res.status(401).json({error:"Unauthorized"});
                // }
            }else{
                res.status(400).json({error:"This method is not allowed"});
            }
    }catch(err){
        console.log(err);
    }
    
}
export default handler;