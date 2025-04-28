import styles from '../../styles/chatRoom.module.css';
import { useState, useRef } from 'react';
import Head from 'next/head';
import { GoogleGenAI, GoogleGenerativeAI } from "@google/genai";
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';






const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API });

export default function Chat(){

    const router = useRouter();
    const [query,setQuery] = useState('');
    const [messages,setMessages] = useState(null);
    const [cases,setCases] = useState(null);
    const [popUp,setPopUp] = useState(false);
    const [userData,setUserData] = useState(null);
    const [conversations,setConversations] = useState(null);
    const [selectedFile,setSelectedFile] = useState(null);

    const [disableInput,setDisableInput] = useState(false);

    const [showFile,setShowFile] = useState(false);

  
    const {user} = useAuth();
    let {chat} = router.query;

    const fileRef = useRef();
    const chatDivRef = useRef();


    useEffect( ()=>{   

        
        const getUser = async ()=>{
            if(user){
                // console.log("here");
                const [userDataResponse] = await Promise.all([
                    fetch(`/api/users/getuser?userUID=${user.uid}`),
                ]);
                const userData = await userDataResponse.json();
                if(userDataResponse.ok && user){
                    router.push(`/research/${chat}`);
                    setUserData(userData);
                }else{
                    router.push("/SignUp");
                } 
            }
        }
        getUser();


    },[chat]);

    useEffect(()=>{

        const getConversations = async ()=>{

            const conversationResponse = await fetch(`/api/conversations/fetchconversation?userUID=${user.uid}`);
            const conversationsData = await conversationResponse.json();
            if(conversationResponse.ok && conversationsData){
                setConversations(conversationsData.conversations);
            }
        }

        getConversations();
    },[chat]);

    useEffect(()=>{
        const getMessages = async()=>{
            // console.log('conversationID',chat);
            const messageResponse = await fetch(`/api/messages/fetchmessage?conversationID=${chat}`);
            const messagesData = await messageResponse.json();
            // console.log('messages from conversations',messagesData.messages[0].content);
            if(messageResponse.ok && messagesData){
                setMessages(messagesData.messages);

                console.log('opening an existing conversation',chat);
               
            }
        }

        getMessages();

    },[chat]);


    useEffect(()=>{
        if(chatDivRef.current && chatDivRef.current.scrollHeight){
              chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight ;
        }
    },[messages,query]);


    //function for detecting user intent
    const detectIntent = async (prompt)=>{


        const intentResponse = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `classify the intent of the following request into (general query and, find legal case related query) use one word only ${prompt}`,
        });

        let intentText = intentResponse.text;
        return intentText;


    }


    //new function for intent detection powered by gpt
    const intentDetection = async ()=>{
        console.log("try to talk to the gpt");
        let response =  await fetch(`/api/agent/getintent?query=${query}`);
        let data = await response.json();
        console.log(data);
        return data.intent;
    }


    
    //saves messages to the db
    const saveMessage = async (content,sender,viewMore)=>{


        let messageData;
    

        //new conversation
        if((chat === 'newchat' || chat === 'chat') && sender === 'human'){

                    
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

                    router.push(`/research/${conversationData.conversation._id}`, undefined, { shallow: true });

                    chat = conversationData.conversation._id;


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


                    //updated data
                    console.log('updating current conversation',conversationData.conversation._id);
                  

        }else{

            console.log('using an existing conversation',chat); 

            messageData = {
                conversationID:chat,
                userUID:userData.user.firebaseUid,
                sender:sender,
                file:'',
                type:'text',
                messageTime: new Date(),
                content:content,
                viewMore:viewMore
            };

            const response = await fetch('/api/messages/addmessage', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });


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


            console.log("trying to query the ai");

            let gptIntent = await intentDetection(prompt);
            let normalizedIntent = gptIntent.toLowerCase();

            let viewMore = false;
            // console.log('gpt said:',normalizedIntent);

            if(normalizedIntent === 'general query'){
            
                let generalResponse;

                    //checking if user has added a file
                    if(selectedFile !== null){
                        setShowFile(false);

                        const { default: pdfToText } = await import('react-pdftotext');

                        const text = await pdfToText(selectedFile);

                        generalResponse = await genAI.models.generateContent({
                            model: "gemini-2.0-flash",
                            contents: `response to this in few lines -  ${prompt} pdf: ${text}`,
                        });
                    
                        setSelectedFile(null);
                        
                    
                    
                    }else{
                        generalResponse = await genAI.models.generateContent({
                            model: "gemini-2.0-flash",
                            contents: `response to this in few lines -  ${prompt}`,
                        });
                    }



                //answer from the LLM
                let generalText = generalResponse.text;

                let newMessages;
                let savedMessages = await saveMessage(generalText,'ai',viewMore);



                if(messages !== null){
 
                    //when messages array is not null
                    newMessages  = [...messages,{content:generalText,sender:'ai',viewMore:viewMore}];

                }else{
                    
                    newMessages = [{content:prompt,sender:'human'},{content:generalText,sender:'ai',viewMore:viewMore}];

                }
                
                setDisableInput(false);
                return setMessages(newMessages);



    
            }else if (normalizedIntent=== 'fetch case'){

                viewMore = true;

                //getting the specfic kind of case
                let legalResponse = await genAI.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: `find the legal words from the prompt only (example - divorce case) no extra words -  ${prompt}`,
                });

                let legalText =  legalResponse.text;

                let caseResult = await queryCase(legalText);
             
                
                let savedMessages = await saveMessage(caseResult,'ai',viewMore);
         

                let newMessages;
                if(messages !== null){
                   
                    newMessages  = [...messages,{content:caseResult,sender:'ai',viewMore:viewMore}];
                }else{
                   
                    newMessages = [{content:prompt,sender:'human'},{content:caseResult,sender:'ai',viewMore:viewMore}];
                }

                // console.log("newCases that was set:", newCases); 
                setDisableInput(false);
                return setMessages(newMessages);



            }

            


        }catch(err){
            console.log(err);
            return "error either your prompt is against the guidelines or something went wrong";
        }


    }


    //detects the enter after query
    const handleKeyPress = async (e)=>{
        if(e.key === 'Enter'){
            let newQuery = query;
            setQuery('');
            setDisableInput(true);
            let currentMessages = messages;
            if(currentMessages !== null){
                // console.log("not null")
                currentMessages.push({content:newQuery,sender:'human'});
                setMessages(currentMessages);
               await  saveMessage(newQuery,'human',false);
            }else{
                // console.log("null")
                setMessages([{content:newQuery,sender:'human'}]);
              await  saveMessage(newQuery,'human',false);
            }
            await queryAI(newQuery);
           
        }
    }



    const handleInputChange = (e)=>{
       
            let queryValue = String(e.target.value);
            setQuery(queryValue);
        
    }



    const handleButtonChange = ()=>{
        fileRef.current.click();
    }


   

    const handleFileChange = async (event) => {
            // if (!event) return;
            const file = event.target.files[0];
            

            // Check if the selected file is an image
            if (file && file.type === 'application/pdf') {
                setShowFile(true);
                setSelectedFile(file);
               
            } else {
                console.error('Please select a valid image file');
            
            }
    };

    return(
        <>
            <Head>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
            <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Istok+Web:ital,wght@0,400;0,700;1,400;1,700&family=Joan&display=swap" rel="stylesheet"></link>
            </Head>
            <div className={styles.container}>
                <div className={styles.leftSection}>
                    <div className={styles.leftSection_top}>
                        <h2 className={styles.leftSection_header}>Research History</h2>
                        <button onClick={()=>{router.push('/research/newchat'); setMessages(null);}}  className={styles.leftSection_newPage_button}>
                                <img src={'/create.png'} width={28} height={28} className={styles.leftSection_button_image}/>
                        </button>
                    </div>
                
                    <div className={styles.leftSection_history}>
                        {userData && conversations && conversations.map((i,index)=>{
                            // console.log(i);
                            return(
                        
                                <Link href={`/research/${i._id}`} className={styles.leftSection_history_convo}>
                                  <p>{i.title.slice(0,25)}..</p>
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
                            <div className={styles.rightSection_chat_content} ref={chatDivRef}>
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
                                                                   <img src='/shinning_black.png' width={20} height={20}/>
                                                                   <p className={styles.message_content_ai_title}>Generated</p>
                                                           </div>
                                                            <p className={styles.ai_message} dangerouslySetInnerHTML={{ __html: messages[index].content }} />
                                                           {messages[index].viewMore && <button onClick={()=>setPopUp(true)} className={styles.ai_message_more_link}>View More</button>}

                                                            {popUp ?
                                                                    <>
                                                                        <div className={styles.popUp_container}>
                                                                                <div className={styles.popUp_div}>
                                                                                  {cases[cases.length - 1].title &&  <h2 className={styles.popUp_div_title}>{cases[cases.length - 1].title}</h2>}
                                                                                   {cases[cases.length - 1].docsource && <p className={styles.popUp_div_paragraph}>Source: {cases[cases.length -1].docsource}</p>}
                                                                                    {cases[cases.length - 1].publishdate && <p className={styles.popUp_div_paragraph}>Dated: {cases[cases.length - 1].publishdate}</p>}

                                                                                    {/* <div className={styles.popUpdiv_bottom}> */}
                                                                                        <div className={styles.popUp_div_document}>
                                                                                            {cases[cases.length - 1].doc && <p dangerouslySetInnerHTML={{ __html: cases[cases.length -1].doc }}/>}
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
                                    {selectedFile !== null && showFile && 
                                        <div className={styles.rightSection_inputDiv_fileSection}>
                                            <div className={styles.rightSection_inputDiv_fileDiv}>
                                               
                                                    <img src={'/file.png'} width={25} height={25}/>
                                                    <p className={styles.document_name}>{selectedFile.name.slice(0,12)}..</p>
                                              
                                            </div>
                                        </div>
                                    }
                                    <textarea className={styles.rightSection_input} onChange={handleInputChange} placeholder='Research' onKeyPress={handleKeyPress} value={query} disabled={disableInput}/>
                                 
                                        <div className={styles.rightSection_inputDiv_document_button}>
                                                <input type='file' className={styles.rightSection_inputDiv_file} ref={fileRef} onChange={(e)=>handleFileChange(e)}/>
                                                <button className={styles.rightSection_inputDiv_button} onClick={()=>handleButtonChange()}>
                                                    <img src={'/plus.png'} width={35} height={35}/>
                                                </button>

                                                <input type='file' className={styles.rightSection_inputDiv_file} ref={fileRef} onChange={(e)=>handleFileChange(e)}/>
                                                <button className={styles.rightSection_inputDiv_voiceButton} onClick={()=>handleButtonChange()}>
                                                    <img src={'/sound-recognition.png'} width={30} height={30}/>
                                                </button>
                                            
                                        </div>
                                        
                                             
                                            
                                       
                                    
                                </div>
                        </div>
                </div>
            </div>
        </>
    )
}