import { adminSecretKey } from "../app.js";
import { CHAT_TOKEN } from "../constants/config.js";
import { User } from "../models/user.js";
import { ErrrorHandler } from "../utils/utility.js";
import JWT from "jsonwebtoken";


const  isAuthenticated=(req,res,next)=>{

    const token =req.cookies[CHAT_TOKEN];

    if(!token)
        
       return next (new ErrrorHandler("Please login to access this route",401));

        const decodedData=JWT.verify(token, process.env.JWT_SECRET);
       
       req.user= decodedData._id
      

    next();
};

const  adminOnly=(req,res,next)=>{

    const token =req.cookies["chat-app-admin"];

    if(!token)
        return next (new ErrrorHandler("Only admin can acces this route ",401));

        const secretKey  =JWT.verify(token, process.env.JWT_SECRET);
       
        const isMatched= secretKey === adminSecretKey;
        if(!isMatched) return next(new ErrrorHandler("Invalid admin key",401));
       
       

    next();
};

const socketAuthenticator = async (err,socket,next)=>{
   try {
    if(err)
    return next(err);

    const authToken = socket.request.cookies[CHAT_TOKEN];

    if (!authToken) return next(new ErrrorHandler("Please login to access this route", 401));

    const decodedData = JWT.verify(authToken, process.env.JWT_SECRET);

    const user =await User.findById(decodedData._id) ;

    if(!user) return next(new ErrrorHandler("Please login to access this route", 401));


    socket.user = user;

    return next();

   } catch (error) {
    console.log(error)
    return next(new ErrrorHandler("Please login to access this route", 401));
   }
}


export {isAuthenticated, adminOnly,socketAuthenticator}