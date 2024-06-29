import { useInputValidation } from "6pp";
import { Search as SearchIcon } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  InputAdornment,
  List,
  Stack,
  TextField
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserItem from '../component/shared/UserItem';
import { useLazySearchUserQuery, useSendFriendRequestMutation } from '../redux/api/api';
import { setIsSearch } from '../redux/reducers/misc';
import { useAsyncMutation } from "../hooks/hook";



const Search = () => {

  
  const {isSearch} =useSelector((state)=>state.misc);

  const [searchUser] =useLazySearchUserQuery()

  const [sendFriendRequest , isLoadingSendFriendRequest]=useAsyncMutation(useSendFriendRequestMutation);

  const dispatch=useDispatch();

  const search =useInputValidation("");

 

  const [user,setUser]=useState([]);

  const addFriendHandler=async (id)=>{
   await sendFriendRequest("sending friend request...",{ userId: id});
  
   
   
  }

  useEffect(() => {

    const timeOutId = setTimeout(()=>{
      searchUser(search.value)
      .then(({ data }) => setUser(data.users))
      .catch((err)=> console.log(err))
      
    },1000)
     
    return () => {
      clearTimeout(timeOutId);
    };
    
  }, [search.value])
  

  const searchCloseHandler=()=> dispatch(setIsSearch(false));
  return (
    <Dialog open={isSearch} onClose={searchCloseHandler}>
      <Stack p={"2rem"} direction={"column"} width={"25rem"}>
       <DialogTitle textAlign={"center"}>Find People</DialogTitle>
       <TextField
        label="" 
        value={search.value}
         onChange={search.changeHandler}
         variant='outlined'
         size="small"
         InputProps={{
          startAdornment:(
            <InputAdornment position='start'>
            <SearchIcon/>
            </InputAdornment>
          )
         }}
         />

         <List>
          {
            user.map((i)=>(
              <UserItem user={i}
              key={i._id}
              handler={addFriendHandler}
              handlerIsLoading={isLoadingSendFriendRequest}
              />
            ))
          }
         </List>
      </Stack>
    </Dialog>
  )
}

export default Search