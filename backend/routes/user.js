import express from "express";
import { 
    acceptFriendRequest,
    getMyFriends,
    getMyProfile,
    getNotifications,
    login, 
    logout,
    newUser, 
    searchUser,
    sendRequest
 } from "../controllers/user.js";
import {singleAvtar } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { 
    acceptRequestValidator, 
    loginValidator, 
    registerValidator, 
    sendRequestValidator, 
    validateHandler 
} from "../lib/validators.js";

const app=express.Router();

app.post("/new",singleAvtar,registerValidator(),validateHandler,newUser)
app.post("/login",loginValidator(),validateHandler,login );

//after here user must be logged in to access the routes
app.use(isAuthenticated)

app.get("/me",getMyProfile)

app.get("/logout",logout)

app.get("/search",searchUser)

app.put("/sendrequest",sendRequestValidator(),validateHandler,sendRequest)

app.put("/accept-request",acceptRequestValidator(),validateHandler,acceptFriendRequest)

app.get("/notifications",getNotifications)

app.get("/friends",getMyFriends)

export default app;