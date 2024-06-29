import { Delete as DeleteIcon,
        Add as AddIcon,
        Done as DoneIcon,
        Edit as EditIcon,
        KeyboardBackspace as KeyboardBackspaceIcon,
        Menu as MenuIcon,
 } from '@mui/icons-material'
import { Backdrop,
        Box,
        Button,
        Drawer,
        Grid, 
        IconButton, 
        Stack, 
        TextField, 
        Tooltip, 
        Typography } from '@mui/material'
import React, { memo, useEffect, useState,lazy, Suspense } from 'react'
import { bgGradiant, matBlack } from '../constants/Color'
import { useNavigate,useSearchParams } from 'react-router-dom'
import { Link } from '../component/styles/StyledComponent'
import AvatarCard from '../component/shared/AvatarCard'
import { sampleChats, sampleUser } from '../constants/SampleData'
import UserItem from '../component/shared/UserItem'
import { useAddGroupMembersMutation, useChatDetailsQuery, useMyGroupsQuery, useRemoveGroupMemberMutation, useRenameGroupMutation } from '../redux/api/api'
import { useAsyncMutation, useErrors } from '../hooks/hook'
import { LayoutLoader } from '../component/layout/Loaders'
import { useDispatch, useSelector } from 'react-redux'
import { setIsAddMember } from '../redux/reducers/misc'

const ConfirmDeleteDialog=lazy(()=>import ("../component/dialogs/ConfirmDeleteDialog"));
const AddMemberDialog=lazy(()=>import ("../component/dialogs/AddMemberDialog"));




  const Groupe = () => {

  const chatId=useSearchParams()[0].get("group");

  const navigate= useNavigate();

  const dispatch=useDispatch();

  const {isAddMember} =useSelector((state)=>state.misc)

  const myGroups = useMyGroupsQuery("");

 const groupDetails = useChatDetailsQuery(
  {chatId,populate:true},
  {skip: !chatId}
 );

 const [updateGroup, isLoadingGroupName] =useAsyncMutation(useRenameGroupMutation);

 const [removeMember, isLoadingRemoveMember] =useAsyncMutation(useRemoveGroupMemberMutation);

 

  const [isMobileMenuOpen,setIsMobileMenuOpen]=useState(false);
  const [isEdit,setIsEdit]=useState(false);
  const [confirmDeleteDialog,setConfirmDeleteDialog]=useState(false);
  
  const [groupName,setGroupName]=useState("");

  const [groupNameUpdatedValue,setGroupNameUpdatedValue]=useState("");

const errors=[{
  isError: myGroups.isError,
  error: myGroups.error
},
{
  isError: groupDetails.isError,
  error: groupDetails.error
}
];

 const [members,setMembers]= useState([]);

  useErrors(errors);

 useEffect(()=>{
  if(groupDetails.data){
    setGroupName(groupDetails.data.chat.name);
    setGroupNameUpdatedValue(groupDetails.data.chat.name);
    setMembers(groupDetails.data.chat.members);
  }
  return()=>{
    setGroupName("");
    setGroupNameUpdatedValue("");
    setMembers([]);
    setIsEdit(false);
  }
},[groupDetails.data])

  const navigateBack=()=>{
   navigate("/");
  };

  const handleMobile=()=>{
    setIsMobileMenuOpen((prev)=>!prev)};

    const handleMobileClose=()=>{
      setIsMobileMenuOpen(false);
    };
    const updateGroupName=()=>{
      setIsEdit(false);
      updateGroup("Updating Group Name....",{chatId,name:groupNameUpdatedValue})
      
    };

    const openConfirmDeleteHandler=()=>{
      setConfirmDeleteDialog(true);
      console.log(" delete group");
    }

    const closeConfirmDeleteHandler=()=>{
      setConfirmDeleteDialog(false);
    }

    const openAddMemberHandler=()=>{
     dispatch(setIsAddMember(true));
    };

    const deleteHandler=()=>{
      console.log("delete handler");
      closeConfirmDeleteHandler();
    };

    const removeMemberHandler=(userId)=>{
      removeMember("Removing member...",{chatId, userId});
    };
    
    useEffect(()=>{
    if(chatId){
      setGroupName(`group name ${chatId}`);
      setGroupNameUpdatedValue(`group name ${chatId}`);
    };

     return()=>{
       setGroupName("");
       setGroupNameUpdatedValue("");
       setIsEdit(false);
     }
    
    },[chatId])


  const IconBtns=(
  <>
<Box>
<IconButton 
onClick={handleMobile}
sx={{
    display:{
      xs:"block",
      sm:"none",
      position:"fixed",
      right:"1rem",
      top:"1rem"
    
    }
  }}>
    <MenuIcon />
  </IconButton>
</Box>
 
 <Tooltip title="back">
 <IconButton
 onClick={navigateBack}
  sx={{
    position: "absolute",
    top: "2rem",
    left: "2rem",
    bgcolor: matBlack,
    color: "white",
    ":hover": {
      bgcolor: "rgba(0,0,0,0.6)"
    }
  }}
>
  <KeyboardBackspaceIcon  />
</IconButton>

    </Tooltip>
  </>);

  const GroupName=(
  <Stack 
  direction={"row"}
  alignItems={"center"}
  justifyContent={"center"}
  spacing={"1rem"}
  padding={"3rem"}
  >
   { isEdit?(<>
   <TextField value={groupNameUpdatedValue} 
   onChange={e=>setGroupNameUpdatedValue(e.target.value)}/>
   <IconButton onClick={updateGroupName}
   disabled={isLoadingGroupName}
   >
    <DoneIcon/>
   </IconButton>
   </>
  ):( 
  <>
    <Typography variant='h4'>{groupName}</Typography>
    <IconButton 
    disabled={isLoadingGroupName}
    onClick={()=>setIsEdit(true) }>
      <EditIcon/>
    </IconButton>
    </>
    ) };
  </Stack>
  );

   const ButtonGroup=(<Stack
   direction={{
    xs:"column-reverse",
    sm:"row"
   }}
   spacing={"1rem"}
   p={{
    xs:"0",
    sm:"1rem",
    md:"1rem 4rem"
   }}
   >
  <Button size="large" color="error" startIcon={<DeleteIcon/>}
  onClick={openConfirmDeleteHandler}
  > Delete Group 
  </Button>
  <Button size="large" variant="contained" startIcon={<AddIcon/>}
  onClick={openAddMemberHandler}
  >Add member</Button>
   </Stack>
   )
  return myGroups.isLoading?<LayoutLoader/> : (
    <Grid container height={"100vh"}
    >
      <Grid
      item
      sx={{
        display:{
          xs:"none",
          sm:"block"
        },
        
      }}
      sm={4}
      >
        <GroupsList myGroups={myGroups?.data?.groups} chatId={chatId}/>
      </Grid>
      <Grid
      item 
      xs={12}
       sm={8}
        sx={{
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        position :"relative",
        padding:"1rem 3rem"
       
      }}
      >
       
      {IconBtns}


      { groupName &&(
      <>
      {GroupName}
      <Typography 
      margin={"2rem"}
      alignSelf={"flex-start"}
      variant="body1"
      >
        members
      </Typography>
      <Stack
      maxWidth={"45rem"}
      width={"100%"}
      boxSizing={"border-box"}
      padding={{
        sm:"1rem",
        xs:"0",
        md:"1rem 4rem",
      }}
      spacing={"2rem"}
       height={"50vh"}
      
      >


        {
          members.map((i) => (
            <UserItem
             user={i}
             key={i._id}
             isAdded
             styling={{
            boxShadow:"0 0 0.5rem rgba(0,0,0,0.2)",
            padding:"1rem 2rem",
            borderRadius:"1rem"
             }}
             handler={removeMemberHandler}
            />
           ) )
        }
      </Stack>
      {ButtonGroup}  
      </>
    )}
      </Grid>
      {
        isAddMember &&(
          <Suspense fallback={<Backdrop open/>}>
           <AddMemberDialog chatId={chatId}/>
           
        </Suspense>)
      }
 
        {confirmDeleteDialog  && (
          <Suspense fallback={<Backdrop open/>}>
          <ConfirmDeleteDialog
          open={confirmDeleteDialog}
          handleClose={closeConfirmDeleteHandler}
          deleteHandler={deleteHandler}
          />
          </Suspense>
        )}
     <Drawer
      sx={{
      display:{
        xs:"block",
        sm:"none"
      }
     }}
      open={isMobileMenuOpen} 
      onClose={handleMobileClose}>
          <GroupsList w={"50vw"} myGroups={myGroups?.data?.groups} chatId={chatId}/>
         </Drawer>
    </Grid>
  )
}
const GroupsList=({w="100%",myGroups=[],chatId})=>(
  <Stack 
  width={w} 
  sx={{
    backgroundImage:bgGradiant,
    height:"100vh"
  }}
  overflow={"auto"}
  >
    {myGroups.length > 0 ?( myGroups.map((group)=><GroupListItem group={group}
    chatId={chatId} key={group._id}/>)
  ):(
  <Typography textAlign={"center"}>No Groups</Typography>
  )};
  </Stack>
);
const GroupListItem=memo(({group,chatId})=>{
  const{
    name,avatar,_id
  }=group;
  return(<Link to={`?group=${_id}`} onClick={e=>{if(chatId===_id) e.preventDefault();
  }}>
  <Stack 
   gap={"1rem"}
   padding={"1rem"}
  direction={"row"}
  spacing={"1rem"}
  alignItems={"center"}
  >
    <AvatarCard avatar={avatar}/>
    <Typography>{name}</Typography>
    </Stack></Link>)
});

export default Groupe;