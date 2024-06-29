import React, { useEffect, useState } from 'react'
import AdminLayout from '../../component/layout/AdminLayout'
import Table from '../../component/shared/Table'
import { Avatar } from '@mui/material'
import { dashboardData } from '../../constants/SampleData'
import {transformImage } from '../../lib/Features'


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
    <Avatar
    alt={params.row.name} 
    src={params.row.avatar}
    />
  ),
  },
  {
    field:"name",
    headerName:"name",
    headerClassName:"table-header",
    width:200,
  },
  {
    field:"username",
    headerName:"Username",
    headerClassName:"table-header",
    width:200,
  },{
    field:"friends",
    headerName:"Friends",
    headerClassName:"table-header",
    width:150,
  },
  {
    field:"groups",
    headerName:"Groups",
    headerClassName:"table-header",
    width:200,
  }

]

const UserManagement = () => {

  const [rows,setRows]=useState([]);

  useEffect(()=>{
    setRows(dashboardData.users.map((i)=>(
      {...i,
      id : i._id ,
      avatar:transformImage(i.avatar,50),
    })));
  },[]
);
  return (
    <AdminLayout>
        <Table heading={"All users"} columns={columns} rows={rows} />
    </AdminLayout>
  )
}

export default UserManagement