import fetch from "node-fetch";
import OpenAI from "openai";
export default async function handler(req, res) {
    const openai = new OpenAI({apiKey:process.env.OPENAI_KEY});
    const request = req.query.query;
   
    async function query(data) {
        try{
           
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o', // Use the appropriate model
                messages: [
                    { role: 'system', content: "You are a helpful assistant named Vakeel AI created for helping lawyers." },
                    { role: 'user', content:`Classify the given query in (general query, fetch case or draft document). note: answer in only one of the given categories.
                        query: ${data}
                       ` 
                    }
                ],
                max_tokens: 150,
                temperature: 0.7,
            });
            

            const responseText = completion.choices[0].message.content;
            return responseText;

        }catch(err){
            console.log(err);
            res.status(500).json({ error: 'some problem with the api' });
        }
    }

    async function answer(data) {
        // const response = await fetch(
        //     "https://api-inference.huggingface.co/models/deepset/roberta-base-squad2",
        //     {
        //         headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}` },
        //         method: "POST",
        //         body: JSON.stringify(data),
        //     }
        // );
        // const result = await response.json();
        // return result;
        console.log(data);
        const completion = await openai.chat.completions.create({
            model: 'gpt-4', // Use the appropriate model
            messages: [
                { role: 'system', content: "You are a helpful assistant named Jarvis created by Abhishek Kholiya." },
                { role: 'user', content:`${data.inputs.question}
                    query: ${data.inputs.context}
                   `  }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        const responseText = completion.choices[0].message.content;
        return responseText;
    }
   
    
    
    try {
        // Await the query function and handle the response properly
        const response = await query(request);
        console.log("Response:", response);

        if (response) {
            const normalizedResponse = response.toLowerCase();
            // Check for different intents and respond accordingly
            if (normalizedResponse === 'general query') {
                console.log("General talk identified");
                return res.status(200).json({ message: response, intent: "general query" });
            } else if (normalizedResponse === 'fetch case') {
                console.log("Fetch case identified");
                return res.status(200).json({ message: response, intent: "fetch case" });
            } else if (normalizedResponse === 'draft document') {
                console.log("Draft document identified");
                return res.status(200).json({ message: response, intent: "draft document" });
            } else {
                console.log("Unknown intent");
                return res.status(400).json({ message: "Invalid intent", intent: "unknown" });
            }
        } else {
            console.log("No response from OpenAI.");
            return res.status(400).json({ message: "No valid response from OpenAI." });
        }
    } catch (err) {
        console.error("Error in handler:", err);
        return res.status(500).json({ error: 'Some problem with the API' });
    }
}