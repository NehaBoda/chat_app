import { useDispatch } from 'react-redux';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import AppLayout from '../component/layout/AppLayout';
import { IconButton, Skeleton, Stack } from '@mui/material';
import { greyColor } from '../constants/Color';
import { AttachFile as AttachFileIcon, Send as SendIcon } from '@mui/icons-material';
import { InputBox } from '../component/styles/StyledComponent';
import FileMenu from '../component/dialogs/FileMenu';
//import { sampleMeassage } from '../constants/SampleData';
import MessageComponenet from '../component/shared/MessageComponenet';
import { getSocket } from '../socket';
import { ALERT, NEW_MESSAGE, START_TYPING,STOP_TYPING } from '../constants/events';
import { useChatDetailsQuery, useGetMessagesQuery } from '../redux/api/api';
import { useErrors, useSocketEvents } from '../hooks/hook';
import {useInfiniteScrollTop} from "6pp";
import { setIsFileMenu } from '../redux/reducers/misc';
import { removeNewMessagesAlert } from '../redux/reducers/chat';
import { TypingLoader } from '../component/layout/Loaders';






const Chat = ({chatId,user}) => {

  

  const containerRef =useRef(null);
  const bottomRef =useRef(null);

  const socket = getSocket();
  const dispatch = useDispatch();

  const [message, setMessage] =useState("");
  const [messages, setMessages] =useState([]);
  const [page, setPage] =useState(1);
  const [fileMenuAnchor, setFileMenuAnchor] =useState(null);

  const [imTyping,setImTyping]= useState(false);
  const [userTyping,setUserTyping] = useState(false);
  const typingTimeout =useRef(null);

 

  const chatDetails = useChatDetailsQuery({chatId,skip:!chatId});


 const oldMessagesChunk = useGetMessagesQuery({chatId,page});


 const { data : oldMessages , setData : setOldMessages}= useInfiniteScrollTop(
  containerRef,
  oldMessagesChunk.data?.totalPages,
  page,
  setPage,
  oldMessagesChunk.data?.messages
 );

  const errors = [
    {isError : chatDetails.isError , error : chatDetails.error},
    {isError : oldMessagesChunk.isError , error : oldMessagesChunk.error}
  ];

  
 
  
  const members =chatDetails?.data?.chat?.members;

  const messageOnChange =(e)=>{
    setMessage(e.target.value);

    if(!imTyping){
      socket.emit(START_TYPING,{members, chatId});
      setImTyping(true);
    }

    if(typingTimeout.current) clearTimeout(typingTimeout.current)

   typingTimeout.current = setTimeout(()=>{
      socket.emit(STOP_TYPING, {members, chatId});
      setImTyping(false);
    },[2000]  )
  };

  const handleFileOpen =(e)=>{
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget);
  };

  const submitHandler =(e)=>{
    e.preventDefault();

   if (!message.trim()) return;

   

   //emitting message to the server

   socket.emit(NEW_MESSAGE,{chatId,members,message});
   setMessage("");
  };

  useEffect(() =>{

    dispatch(removeNewMessagesAlert(chatId));

   return () =>{
    setMessages([]);
    setMessage("");
    setPage(1);
    setOldMessages([]);
   }

  },[chatId]);

  useEffect(()=>{
   if(bottomRef.current)
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages])

  const newMessagesHandler =useCallback((data) => {

    if (data.chatId !== chatId) return;
   
    setMessages((prev) => [...prev, data.message]);
  },[chatId]);

  const startTypingListener =useCallback((data) => {

    if (data.chatId !== chatId) return;
   
   
   setUserTyping(true);
  },[chatId]);

  const stopTypingListener =useCallback((data) => {

    if (data.chatId !== chatId) return;
   
   
   setUserTyping(false);
  },[chatId]);

  const alertListener =useCallback((content)=>{
     const messageForAlert={
      content,
      sender:{
        _id:"dfsdfsdfdfsdxcddfsdfdasfdf",
        name:"Admin",
      },
      chat:chatId,
      createdAt: new Date().toISOString(),
     };
     setMessages((prev)=>[...prev,messageForAlert]);
  },[chatId])

  const eventArr = {
    [NEW_MESSAGE]: newMessagesHandler,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
    [ALERT]:alertListener,
  };

  useSocketEvents(socket, eventArr);

  useErrors(errors);

  const allMessages = [...oldMessages,...messages]

 

  
  return chatDetails.isLoading ? (
  <Skeleton/>
   ):(
   <>
   <Stack
   ref={containerRef}
   boxSizing={"border-box"}
   padding={"1rem"}
   spacing={"1rem"}
   bgcolor={greyColor}
   height={"90%"}
   sx={{
    overflowX:"hidden"
    ,overflowY:"auto"
   }}
   >
   

    {allMessages.map((i)=>(
        <MessageComponenet key={(i._id)} message={i} user={user}/>
      ))
    }
    {userTyping && <TypingLoader/>}
    <div ref={bottomRef}/>
   </Stack>
   <form
   style={{
    height:"10%"
   }}
   onSubmit={submitHandler}
   >
    <Stack
    direction={"row"}
    height={"100%"}
    padding={"1rem"}
    alignItems={"center"}
    position={"relative"}
    >
      <IconButton
      sx={{
        position:"absolute",
        left:"1.5rem",
       rotate:"30deg"
      }}
      onClick={handleFileOpen}
      >
        <AttachFileIcon/>
      </IconButton>
      <InputBox placeholder="Type message here....." 
      value={message}
      onChange={messageOnChange}/>

      <IconButton 
      type='submit'
      sx={{
        rotate:"-30deg",
        backgroundColor:"#ea7070",
        color:"white",
        marginLeft:"1rem",
        padding:"0.5rem",
      "&:hover":{
        backgroundColor:"error.dark"
      }

      }}
      >
        <SendIcon/>
      </IconButton>
    </Stack>
   </form>
   <FileMenu anchorEl={fileMenuAnchor} chatId={chatId}/>
   </>
  );
}

export default AppLayout()(Chat);