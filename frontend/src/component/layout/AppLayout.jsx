import React, { useCallback, useEffect } from 'react';
import { Drawer, Grid, Skeleton } from '@mui/material';
import Header from './Header';
import Title from '../shared/Title';
import ChatList from '../../specific/ChatList';
import { useParams } from 'react-router-dom';
import Profile from '../../specific/Profile';
import { useMyChatsQuery } from '../../redux/api/api';
import { useDispatch, useSelector } from 'react-redux';
import { setIsMobileMenu } from '../../redux/reducers/misc';
import { useErrors, useSocketEvents } from '../../hooks/hook';
import { getSocket } from '../../socket';
import { NEW_MESSAGE_ALERT, NEW_REQUEST, REFETCH_CHATS } from '../../constants/events';
import { incrementNotification, setNewMessagesAlert } from '../../redux/reducers/chat';
import { getOrSaveFromStorage } from '../../lib/Features';





 const AppLayout =() =>(WrappedComponent)=> {
  return (props)=>{
   const params=useParams();
   const dispatch= useDispatch;
   const chatId=params.chatId;


   
    const socket =getSocket();
   

   const { isMobileMenu }= useSelector((state)=>state.misc)
   const { user }= useSelector((state)=>state.auth)
   const { newMessagesAlert } = useSelector((state) => state.chat);

   //console.log("newMessagesAlert", newMessagesAlert);

   const {isLoading,data,isError,error,refetch} = useMyChatsQuery("")

   useErrors([{isError,error}]);

   useEffect(() => {
    getOrSaveFromStorage({ key : NEW_MESSAGE_ALERT, value: newMessagesAlert});
   },[newMessagesAlert]);

   

   const handleDeleteChat=(e,_id,groupChat)=>{
    e.preventDefault();
    console.log("Delete chat",_id, groupChat);
   }

   const handleMobileClose = () => dispatch(setIsMobileMenu(false));

   const newMessageAlertHandler = useCallback((data)=>{

    if (data.chatId === chatId) return;

    dispatch(setNewMessagesAlert(data));

   },[chatId,dispatch])
    
   

   const newRequestHandler = useCallback(() => {
    dispatch(incrementNotification());
   },[dispatch]);

   const refetchListener = useCallback(() => {
    refetch();
   },[refetch]);

   const eventHandlers = {
    [NEW_MESSAGE_ALERT]: newMessageAlertHandler,
    [NEW_REQUEST]: newRequestHandler,
    [REFETCH_CHATS]: refetchListener,
  }

   useSocketEvents(socket,eventHandlers);

    return (
      <>
        <Title/>
        <Header/>

        {
          isLoading?(
          <Skeleton/>
          ):(
            <Drawer open={isMobileMenu} onClose={handleMobileClose}>
              <ChatList 
                w="70vw"
                chats={data?.chats} 
                chatId={chatId}
                handleDeleteChat={handleDeleteChat}
               newMessagesAlert={newMessagesAlert}
              />
            </Drawer>
          )
        }
        <Grid container height={"calc(100vh - 4rem)"}>
            <Grid item sm={4} md={3} sx={{
              display:{xs:"none",sm:"block"},
            }}
             height={"100%"} 
             >
              {isLoading ? (
                <Skeleton/>
              ) : (
                <ChatList 
                chats={data?.chats} 
                chatId={chatId}
                handleDeleteChat={handleDeleteChat}
                newMessagesAlert={newMessagesAlert}
               
              />
              )}
             </Grid>
            <Grid item xs={12} sm={8} md={5} lg={6} height={"100%"}  >
                <WrappedComponent {...props} chatId={chatId}  user={user}/>
            </Grid>
            <Grid item   md={4} lg={3} height={"100%"} 
            sx={{
              display:{xs:"none",md:"block"},
              padding:"2rem",
              bgcolor:"rgba(0,0,0,0.85)"
            }}
            >
              <Profile user={user}/>
            </Grid>
                 
           </Grid>
        
      </>
    )
  }

 
};
export default AppLayout;