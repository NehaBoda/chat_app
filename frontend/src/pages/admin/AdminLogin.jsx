import React, { useState } from 'react';
import { Container,Paper, Typography, TextField, Button, Stack, Avatar, IconButton } from '@mui/material';
import { bgGradiant } from '../../constants/Color';
import { useInputValidation } from '6pp';
import { Navigate } from 'react-router-dom';

const isAdmin =true;

const AdminLogin = () => {

    const secretKey=useInputValidation("")

    const submitHandler=(e)=>{
        e.preventDefault();
        console.log("submit");
    };

    if(isAdmin) return <Navigate to ="/admin/dashboard"/>;
    

  return (
    <div 
        style={{
           backgroundImage: bgGradiant,
        }}
        >
        <Container component={"main"} maxWidth="xs" sx={{
            height:"100vh",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
        }}>
            <Paper
             elevation={3}
             sx={{
                padding:4,
                display:"flex",
                flexDirection:"column",
                alignItems:"center",
                justifyContent:"center",
             }}
             >
                    <Typography variant="h5">Admin Login</Typography>
                    <form style={{
                        width:"100%",
                        marginTop:"1rem",
                    }}
                    onSubmit={submitHandler}
                    >
                    <TextField 
                    required 
                    fullWidth 
                    label="Secret Key"
                    type="password"
                    margin='normal'
                    variant='outlined'
                    value={secretKey.value}
                    onChange={secretKey.changeHandler}
                    />

                    <Button 
                    sx={{
                        marginTop:"1rem",
                        width:"100%"
                    }}
                    variant="contained" 
                    color="primary"
                    type="submit">
                        Login
                    </ Button>
                    </form>
            </Paper>
        </Container>
        </div>
  )
}

export default AdminLogin