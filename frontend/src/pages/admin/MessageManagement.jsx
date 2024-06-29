import React, { useEffect, useState } from 'react'
import AdminLayout from '../../component/layout/AdminLayout'
import Table from '../../component/shared/Table'
import { Avatar, Box, Stack } from '@mui/material'
import { dashboardData } from '../../constants/SampleData'
import {fileFormat, transformImage } from '../../lib/Features'
import moment from 'moment'
import RenderAttachment from '../../component/shared/RenderAttachment'

const columns=[
  {
    field:"id",
    headerName:"ID",
    headerClassName:"table-header",
    width:200,
  },
  {
    field:"attachments",
    headerName:"Attachments",
    headerClassName:"table-header",
    width:200,
    renderCell:(params)=>{

      const {attachments}=params.row;
      return attachments ?.length > 0 
      ? attachments.map((i)=>{
        const url=i.url;
        const file=fileFormat(url);
        return <Box>
          <a
           href={url}
           download
           targer="_blank"
           style={{
            color:"black"
           }}
          >

            {RenderAttachment(file,url)}
          </a>
        </Box>
      })
      : "No attachments"   
    return
    <Avatar
    alt={params.row.name} 
    src={params.row.avatar}
    />
    },
  },
  {
    field:"content",
    headerName:"Content",
    headerClassName:"table-header",
    width:400,
  },
  {
    field:"sender",
    headerName:"Sent By",
    headerClassName:"table-header",
    width:200,
    renderCell:(params)=>(
      <Stack direction="row" alignItems="center" spacing={"1rem"}>
      <Avatar alt ={params.row.sender.name} src={params.row.sender.avatar}/>
      <span>{params.row.sender.name}</span>
      </Stack>
  ),
  },{
    field:"chat",
    headerName:"Chat",
    headerClassName:"table-header",
    width:220,
  },
  {
    field:"groupChat",
    headerName:"Group Chat",
    headerClassName:"table-header",
    width:100,
  },
  {
    field:"createdAt",
    headerName:"Time",
    headerClassName:"table-header",
    width:250,
  }

]

const MessageManagement = () => {
  const [rows,setRows]=useState([]);

  useEffect(()=>{
   setRows(
    dashboardData.messages.map((i)=>({
      ...i,
      id:i._id,
      sender:{
        name:i.sender.name,
        avatar:transformImage(i.sender.avatar, 50)
      },
      createdAt:moment(i.createdAt).format("DD-MM-YYYY hh:mm A")
    }))
   )
  },[]
);
  return (
    <AdminLayout>
        <Table heading={"All Messages"} columns={columns} rows={rows} rowHeight={200} />
    </AdminLayout>
  )
}


export default MessageManagement