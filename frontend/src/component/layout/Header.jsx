import { useSelector } from 'react-redux';
import React, { Suspense, useState,lazy } from 'react';
import {AppBar,Backdrop,Badge,Box,IconButton,Toolbar, Tooltip, Typography} from '@mui/material';
import { Add as AddIcon,
         Menu as MenuIcon,
         Search as SearchIcon,
         Group as GroupIcon,
         Logout as LogoutIcon, 
         Notifications as NotificationsIcon} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { headerColor } from '../../constants/Color';
import axios from 'axios';
import { server } from '../../constants/config';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setIsMobileMenu, setIsNotification, setIsSearch,setIsNewGroup } from '../../redux/reducers/misc';
import { resetNotification } from '../../redux/reducers/chat';




const SearchDialog = lazy(() => import('../../specific/Search'));
const NotificationDialog = lazy(() => import('../../specific/Notifications'));
const NewGroupDialog = lazy(() => import('../../specific/NewGroup'));


const Header = () => {

   const navigate =useNavigate();

   const dispatch=useDispatch();

   const {isSearch,isNotification,isNewGroup} =useSelector((state)=>state.misc);
   const {notificationCount} =useSelector((state)=>state.chat);

  
   

  const handleMobile = () => {
    dispatch(setIsMobileMenu(true));
  };

  const openSearch = () => {
   dispatch(setIsSearch(true));
  };
  const openNewGroup = () => {
    dispatch(setIsNewGroup(true));
  };
  const openNotification = () => {
    dispatch(setIsNotification(true));
    dispatch(resetNotification());
  }

  const logOutHandler =async () => {
  try{ 
   const{data} =await  axios.get(`${server}/api/v1/user/logout`,
    {
      withCredentials:true,
    })
    toast.success(data.message);
    dispatch(userExists());
  } catch(error){
    toast.error(error?.response?.data?.message || "something went wrong" )
  }
};
  const navigateToGroup = () => navigate ("/groupe");



  return( <>
   <Box sx={{flexGrow:1}} height={"4rem"}>
    <AppBar position="static" sx={{
      bgcolor:headerColor,
    }}>
      <Toolbar>
        <Typography
        variant="h6"
        sx={{
          display:{xs:"none",sm:"block"}
        }}
        >
          Chat_App
        </Typography>

        <Box
         sx={{
          display:{xs:"block",sm:"none"},
        }}>
        <IconButton color="inherit" onClick={handleMobile}>
          <MenuIcon/>
        </IconButton>
        </Box>
        <Box
        sx={{
          flexGrow:1,
        }}
        ></Box>
        <Box>
        <IconBtn
        title={"Search"}
        icon={<SearchIcon/>}
        onClick={openSearch}
        />
        <IconBtn
        title={"New Group"}
        icon={<AddIcon/>}
        onClick={openNewGroup}
        />
        <IconBtn  
        title={"Manage Group"}
        icon={<GroupIcon/>}
        onClick={navigateToGroup}
        />
        <IconBtn  
        title={"Notifications"}
        icon={<NotificationsIcon/>}
        onClick={openNotification}
        value={notificationCount}
        />
        <IconBtn  
        title={"LogOut"}
        icon={<LogoutIcon/>}
        onClick={logOutHandler}
        />

        </Box>
      </Toolbar>
      </AppBar>
      
   </Box>

   {isSearch && 
   (<Suspense fallback={<Backdrop open/>}><SearchDialog/>
   </Suspense>)}
   {isNotification && 
   (<Suspense fallback={<Backdrop open/>}><NotificationDialog />
   </Suspense>)}
   {isNewGroup && 
   (<Suspense fallback={<Backdrop open/>}><NewGroupDialog/>
   </Suspense>)}
   </>
   );
};

const IconBtn=({title,icon,onClick,value})=>{
  return(
    <Tooltip title={title}>
    <IconButton  color="inherit" size="large" onClick={onClick}>
      {
        value ? (<Badge badgeContent={value} color='error'> 
        {icon} 
        </Badge>
        ):( 
        icon
      )}
      
    </IconButton>
    </Tooltip>
  )
}



export default Header