import { Avatar, Stack } from '@mui/material'
import React, { useEffect, useState } from 'react'
import AdminLayout from '../../component/layout/AdminLayout'
import AvatarCard from '../../component/shared/AvatarCard'
import Table from '../../component/shared/Table'
import { dashboardData } from '../../constants/SampleData'
import { transformImage } from '../../lib/Features'


const columns=[
  {
    field:"id",
    headerName:"ID",
    headerClassName:"table-header",
    width:200,
  },
  {
    field:"avatar",
    headerName:"Avatar",
    headerClassName:"table-header",
    width:150,
    renderCell:(params)=>(
    <AvatarCard
    avatar={params.row.avatar}
    />
  ),
  },
  {
    field:"name",
    headerName:"name",
    headerClassName:"table-header",
    width:300,
  },
  {
    field:"totalMembers",
    headerName:"Total Members",
    headerClassName:"table-header",
    width:120,
  },{
    field:"members",
    headerName:"Members",
    headerClassName:"table-header",
    width:400,
    renderCell:(params)=><AvatarCard max={100} avatar={params.row.members}/>
  },
  {
    field:"totalMessages",
    headerName:"Total Messages",
    headerClassName:"table-header",
    width:120,
  },
  {
    field:"creator",
    headerName:"Created BY",
    headerClassName:"table-header",
    width:250,
    renderCell:(params)=>(
      <Stack direction="row" alignItems="center" spacing={"1rem"}>
      <Avatar alt ={params.row.creator.name} src={params.row.creator.avatar}/>
      <span>{params.row.creator.name}</span>
      </Stack>
    )
  }
 

]

const ChatManagement  = () => {

  const [rows,setRows]=useState([]);

  useEffect(()=>{
    setRows(dashboardData.chats.map((i)=>({
      ...i,
      id:i._id,
      avatar:i.avatar.map((i)=>transformImage(i,50)),
      members:i.members.map((i)=>transformImage(i.avatar,50)),
      creator:{
        name:i.creator.name,
        avatar:transformImage(i.creator.avatar, 50)
      }
    }))
  );
  },[]
);
  return (
    <AdminLayout>
        <Table heading={"All Chats"} columns={columns} rows={rows} />
    </AdminLayout>
  )
}



export default ChatManagement;