import styles from '../../styles/chatRoom.module.css';
import { useState } from 'react';
import Head from 'next/head';
import { GoogleGenAI, GoogleGenerativeAI } from "@google/genai";
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API });

export default function Chat(){
    const router = useRouter();
    const [profilePicture, setProfilePicture] = useState('/advocate.png');

    const [query,setQuery] = useState('');
    const [messages,setMessages] = useState(null);
    const [cases,setCases] = useState(null);
    const [popUp,setPopUp] = useState(false);
    const [userData,setUserData] = useState(null);
    const [conversations,setConversations] = useState(null);
    const {user} = useAuth();
    let {chat} = router.query;

    // console.log('chat id',chat);

    //checking if user is logged in 
    useEffect( ()=>{   

        
        const getUser = async ()=>{
            if(user){
                const [userDataResponse] = await Promise.all([
                    fetch(`/api/users/getuser?userUID=${user.uid}`),
                ]);
                const userData = await userDataResponse.json();
                if(userDataResponse.ok && user){
                    router.push(`/research/${chat}`);
                    setUserData(userData);
                    if (userData.user.profilePicture) {
                        setProfilePicture(userData.user.profilePicture);
                    }
                }else{
                    router.push("/SignUp");
                } 
            }
        }
        getUser();


    },[]);

    useEffect(()=>{

        const getConversations = async ()=>{

            const conversationResponse = await fetch(`/api/conversations/fetchconversation?userUID=${user.uid}`);
            const conversationsData = await conversationResponse.json();
            if(conversationResponse.ok && conversationsData){
                setConversations(conversationsData.conversations);
            }
        }

        getConversations();
    },[]);

    useEffect(()=>{
        const getMessages = async()=>{
            // console.log('conversationID',chat);
            const messageResponse = await fetch(`/api/messages/fetchmessage?conversationID=${chat}`);
            const messagesData = await messageResponse.json();
            // console.log('messages from conversations',messagesData.messages[0].content);
            if(messageResponse.ok && messagesData){
                setMessages(messagesData.messages);
            }
        }

        getMessages();

    },[chat]);


    //function for detecting user intent
    const detectIntent = async (prompt)=>{


        const intentResponse = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `classify the intent of the following request into (general query and, find legal case related query) use one word only ${prompt}`,
        });

        let intentText = intentResponse.text;
        return intentText;


    }


    
    //saves messages to the db
    const saveMessage = async (content,sender)=>{


        if(conversations && conversations.length >= 1){

            console.log(userData);
            
            console.log("already exists a conversation");
            let messageData = {
                conversationID:chat,
                userUID:userData.user.firebaseUid,
                sender:sender,
                file:'',
                type:'text',
                messageTime: new Date(),
                content:content
            };

            const response = await fetch('/api/messages/addmessage', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });
            


        }else{
            
            console.log('creating a new conversation');
            let  newData = {
                  title:`${content}`,
                  language:'english',
                  userUID:userData.user.firebaseUid
                  
            }
         
            const response = await fetch('/api/conversations/addconversation', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title:newData.title,
                    language:newData.language,
                    userUID:newData.userUID
                }),
            });

            let conversationData = await response.json();

            console.log('conversation data', conversationData);

            // console.log("firebase user ",userData.user);
    
            let messageData = {
                conversationID:conversationData.conversation._id,
                userUID:conversationData.conversation.userUID,
                sender:sender,
                file:'',
                type:'text',
                messageTime: new Date(),
                content:content
            };
            const messageResponse = await fetch('/api/messages/addmessage', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });


            
            console.log('response', conversationData);

            router.push(`/research/${conversationData.conversation._id}`, undefined, { shallow: true });


            let conversationsArray;
            if(conversations !== null) { 
                conversationsArray = conversations; 

                conversationsArray.push({
                    title:`${content}`,
                    _id:conversationData.conversation._id,
                    language:conversationData.conversation.language,
                    timestamp:conversationData.conversation.timestamp,
                    userUID:newData.userUID
    
    
                });

                setConversations(conversationsArray);
            }else{

             
                conversationsArray = [{
                    title:`${content}`,
                    _id:conversationData.conversation._id,
                    language:conversationData.conversation.language,
                    timestamp:conversationData.conversation.timestamp,
                    userUID:newData.userUID
    
    
                }];
                console.log("converstaions array",conversationsArray);

                setConversations(conversationsArray);
            }

            

            
    
          
        }

    }


    
    //queries the particular case
    const queryCase = async (query)=>{


        const casesDB = await fetch(`/api/fetchCases?query=${query}`);
        const data = await casesDB.json();
    

        // responsible for summarization
        const response = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `summarise this in very short paragraphs (no markdown & no bold text) - ${data.doc}`,
        });
        
    
        const result =  response.text;

        let newResult = 
        `
            From: <Strong>${data.docsource}</Strong> <br/>
            Title: <Strong>${data.title}</Strong> <br/>
            Summary: <br/>
            ${result}
        `;


        //updates the cases record
        let newCases = cases;

        if(cases !== null && Array.isArray(cases)){
            newCases = [...cases,data];
        }else{
            newCases = [data];
        }
        setCases(newCases);

        return newResult;
                      
    }



    //query the ai
    const queryAI = async (prompt)=> {
        
        try{

            let intent = await detectIntent(prompt);
            const normalizedIntent = intent.trim().toLowerCase();


            if(normalizedIntent === 'general'){
            
               
                let generalResponse = await genAI.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: `response to this in few lines -  ${prompt}`,
                });

                let generalText = generalResponse.text;

                let newMessages;
                let savedMessages = await saveMessage(generalText,'ai');


                if(messages !== null){
 
                    //when messages array is not null
                    newMessages  = [...messages,{content:generalText,sender:'ai'}];

                }else{
                    console.log("here shit happened");
                    newMessages = [{content:prompt,sender:'human'},{content:generalText,sender:'ai'}];

                }
                
                return setMessages(newMessages);

    
            }else{

                let legalResponse = await genAI.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: `find the legal words from the prompt only (example - divorce case) no extra words -  ${prompt}`,
                });

                let legalText =  legalResponse.text;


                let caseResult = await queryCase(legalText);
             
                    //this code is responsible
                                  
                    //
                let savedMessages = await saveMessage(caseResult,'ai');
         

            let newMessages;
            if(messages !== null){
                // console.log('not null 2');
                newMessages  = [...messages,{content:caseResult,sender:'ai'}];
            }else{
                // console.log('null 2');
                newMessages = [{content:prompt,sender:'human'},{content:caseResult,sender:'ai'}];
            }
            // console.log("newCases that was set:", newCases); 
            return setMessages(newMessages);

        }

            


        }catch(err){
            console.log(err);
            return "error either your prompt is against the guidelines or something went wrong";
        }
    }

    const handleKeyPress = async (e)=>{
        if(e.key === 'Enter'){
            let newQuery = query;
            setQuery('');
            let currentMessages = messages;
            if(currentMessages !== null){
                // console.log("not null")
                currentMessages.push({content:newQuery,sender:'human'});
                setMessages(currentMessages);
               await  saveMessage(newQuery,'human');
            }else{
                // console.log("null")
                setMessages([{content:newQuery,sender:'human'}]);
              await  saveMessage(newQuery,'human');
            }
            await queryAI(newQuery);
           
        }
    }

    const handleInputChange = (e)=>{
       
            let queryValue = String(e.target.value);
            setQuery(queryValue);
        
    }
    return(
        <>
            <Head>
                <title>Chat Room</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
                <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Istok+Web:ital,wght@0,400;0,700;1,400;1,700&family=Joan&display=swap" rel="stylesheet"></link>
            </Head>
            <div className={styles.container}>
                <div className={styles.leftSection}>
                    <div className={styles.leftSection_top}>
                        <h2 className={styles.leftSection_header}>Research History</h2>
                        <Link href={'/research/hello'} className={styles.leftSection_newPage_button}>
                                <img src={'/edit.png'} width={28} height={28} className={styles.leftSection_button_image}/>
                        </Link>
                    </div>
                
                    <div className={styles.leftSection_history}>
                        {userData && conversations && conversations.map((i,index)=>{
                            // console.log(i);
                            return(
                        
                                <Link href={`/research/${i._id}`} className={styles.leftSection_history_convo}>
                                  <p>{i.title}</p>
                                </Link>
                        
                            )
                        })}
                     </div>
                        
                </div>
                <div className={styles.rightSection}>

                        <div className={styles.rightSection_top}>
                                <h2 className={styles.rightSection_header}>Vakeel Ai</h2>
                                <img className={styles.rightSection_profilePicture} src='/profilepicture.png' width={40} height={40}/>
                        </div>

                        <div className={styles.rightSection_chat}>
                            <div className={styles.rightSection_chat_content}>
                                    {messages && messages.length >= 1 &&  messages.map((i,index)=>{
                                        return(
                                            <>
                                                <div className={styles.message_div}>
                                                
                                                    {messages[index].sender === 'human' ?
                                                        <div className={styles.message_content}>
                                                             <p>{messages[index].content}</p>
                                                        </div>
                                                        :
                                                        <div className={styles.ai_message_div}>
                                                          
                                                            <div className={styles.message_content_ai_left}>
                                                                   <img src='/shining.png' width={20} height={20}/>
                                                                   <p className={styles.message_content_ai_title}>Generated</p>
                                                           </div>
                                                            <p className={styles.ai_message} dangerouslySetInnerHTML={{ __html: messages[index].content }} />
                                                            <button onClick={()=>setPopUp(true)} className={styles.ai_message_more_link}>View More</button>

                                                            {popUp ?
                                                                    <>
                                                                        <div className={styles.popUp_container}>
                                                                                <div className={styles.popUp_div}>
                                                                                    <h2 className={styles.popUp_div_title}>{cases[cases.length - 1].title}</h2>
                                                                                    <p className={styles.popUp_div_paragraph}>Source: {cases[cases.length -1].docsource}</p>
                                                                                    <p className={styles.popUp_div_paragraph}>Dated: {cases[cases.length - 1].publishdate}</p>

                                                                                    {/* <div className={styles.popUpdiv_bottom}> */}
                                                                                        <div className={styles.popUp_div_document}>
                                                                                            <p dangerouslySetInnerHTML={{ __html: cases[cases.length -1].doc }}/>
                                                                                        </div>
                                                                                        <button className={styles.popUp_div_button} onClick={()=>setPopUp(false)}>
                                                                                            Cancel
                                                                                        </button>
                                                                                    {/* </div> */}
                                                                                  


                                                                                </div>

                                                                        </div>
                                                                    </>
                                                                    :
                                                                    <>


                                                                    </>

                                                            }
                                            
                                                        </div>
                                                     
                                                    }


                                                </div>

                                               
                                            
                                            </>
                                        )
                                    })}
                            </div>

                           
                        </div>

                        <div className={styles.rightSection_bottom}>
                                <div className={styles.rightSection_inputDiv} >

                                    <textarea className={styles.rightSection_input} onChange={handleInputChange} placeholder='Research' onKeyPress={handleKeyPress} value={query}/>
                                </div>
                        </div>
                </div>
            </div>
        </>
    )
}