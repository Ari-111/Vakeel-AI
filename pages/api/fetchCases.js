export default async function handler(req, res) {
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { query } = req.query;
   
    if (!query) {
        return res.status(400).json({ error: 'Missing query parameter' });
    }

    const apiUrl = `https://api.indiankanoon.org/search/?formInput=${query}&pagenum=0`;

 

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${process.env.NEXT_PUBLIC_INDIAN_KANOON_API}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
      
       
               
            try{
                
                const requestDocument = await fetch(`https://api.indiankanoon.org/doc/${data.docs[0].tid}/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${process.env.NEXT_PUBLIC_INDIAN_KANOON_API}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });
                const docData = await requestDocument.json();
                return res.status(200).json(docData);
            }catch(err){
                console.log(err);
            }
       
    } catch (error) {
        console.error("Error fetching from Indian Kanoon:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

