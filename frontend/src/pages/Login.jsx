import { useFileHandler, useInputValidation } from '6pp';
import { CameraAlt as CameraAltIcon } from '@mui/icons-material';
import { Avatar, Button, Container, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { bgGradiant } from '../constants/Color';
import { usernameValidator } from '../utils/validators';
import axios from 'axios';

import { useDispatch } from 'react-redux';

import toast from 'react-hot-toast';
import { server } from '../constants/config';
import { userExists } from '../redux/reducers/auth';
import { Navigate } from 'react-router-dom';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const toggleLogin = () => setIsLogin(prev => !prev);

    const name = useInputValidation("");
    const bio = useInputValidation("");
    const username = useInputValidation("", usernameValidator);
    const password = useInputValidation("");
    const avatar = useFileHandler("single");

    const dispatch = useDispatch();

    const handleLogin = async (e) => {
        e.preventDefault();
       const config={
        withCredentials:true,
        headers:{
            "Content-Type":"application/json"
        }
       };

      try {
        const {data} = await axios.post(`${server}/api/v1/user/login`,
        {username:username.value,password:password.value},config
       );
       dispatch(userExists(true));
       toast.success(data.message);
      
        
      } catch (error) {
        toast.error(error?.response?.data?.message || "something went wrong ")
        
      }
       
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", name.value);
        formData.append("bio", bio.value);
        formData.append("username", username.value);
        formData.append("password", password.value);
        formData.append("avatar", avatar.file);

        const config={
            withCredentials:true,
            headers:{
                "Content-Type":"multipart/form-data"
            }
           };

        try {
            const {data} =await axios.post(
                `${server}/api/v1/user/new`,
                formData,
                config
            );
            dispatch(userExists(true));
            toast.success(data.message)
            
        } catch (error) {
            toast.error(error?.response?.data?.message || "something went wrong ")
            
          }
        
    };

    return (
        <div style={{ backgroundImage: bgGradiant }}>
            <Container
                component={"main"}
                maxWidth="xs"
                sx={{
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {isLogin ? (
                        <>
                            <Typography variant="h5">Login</Typography>
                            <form
                                style={{
                                    width: "100%",
                                    marginTop: "1rem",
                                }}
                                onSubmit={handleLogin}
                            >
                                <TextField
                                    required
                                    fullWidth
                                    label="Username"
                                    margin="normal"
                                    variant="outlined"
                                    value={username.value}
                                    onChange={username.changeHandler}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    margin="normal"
                                    variant="outlined"
                                    value={password.value}
                                    onChange={password.changeHandler}
                                />
                                <Button
                                    sx={{
                                        marginTop: "1rem",
                                        width: "100%",
                                    }}
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                >
                                    Login
                                </Button>
                                <Typography textAlign={"center"} m={"1rem"}>OR</Typography>
                                <Button
                                    sx={{
                                        marginTop: "1rem",
                                    }}
                                    variant="text"
                                    fullWidth
                                    onClick={toggleLogin}
                                >
                                    Sign Up Instead
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Typography variant="h5">Sign Up</Typography>
                            <form
                                style={{
                                    width: "100%",
                                    marginTop: "1rem",
                                }}
                                onSubmit={handleSignUp}
                            >
                                <Stack
                                    position={"relative"}
                                    width={"10rem"}
                                    margin={"auto"}
                                >
                                    <Avatar
                                        sx={{
                                            width: "10rem",
                                            height: "10rem",
                                            objectFit: "contain",
                                        }}
                                        src={avatar.preview}
                                    />
                                    <IconButton
                                        sx={{
                                            position: "absolute",
                                            bottom: "0",
                                            right: "0",
                                            color: "white",
                                            bgcolor: "rgba(0,0,0,0.2)",
                                            ":hover": {
                                                bgcolor: "rgba(0, 0, 0, 0.7)",
                                            },
                                        }}
                                        component="label"
                                    >
                                        <>
                                            <CameraAltIcon />
                                            <input type="file" hidden onChange={avatar.changeHandler} />
                                        </>
                                    </IconButton>
                                </Stack>
                                {avatar.error && (
                                    <Typography
                                        m={"1rem auto"}
                                        width={"fit-content"}
                                        display={"block"}
                                        color="error"
                                        variant="caption"
                                    >
                                        {avatar.error}
                                    </Typography>
                                )}
                                <TextField
                                    required
                                    fullWidth
                                    label="Name"
                                    margin="normal"
                                    variant="outlined"
                                    value={name.value}
                                    onChange={name.changeHandler}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Username"
                                    margin="normal"
                                    variant="outlined"
                                    value={username.value}
                                    onChange={username.changeHandler}
                                />
                                {username.error && (
                                    <Typography color="error">{username.error}</Typography>
                                )}
                                <TextField
                                    required
                                    fullWidth
                                    label="Bio"
                                    margin="normal"
                                    variant="outlined"
                                    value={bio.value}
                                    onChange={bio.changeHandler}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    margin="normal"
                                    variant="outlined"
                                    value={password.value}
                                    onChange={password.changeHandler}
                                />
                                <Button
                                    sx={{
                                        marginTop: "1rem",
                                        width: "100%",
                                    }}
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                >
                                    Sign UP
                                </Button>
                                <Typography textAlign={"center"} m={"1rem"}>OR</Typography>
                                <Button
                                    sx={{
                                        marginTop: "1rem",
                                    }}
                                    variant="text"
                                    fullWidth
                                    onClick={toggleLogin}
                                >
                                    Login Instead
                                </Button>
                            </form>
                        </>
                    )}
                </Paper>
            </Container>
        </div>
    );
};

export default Login;
