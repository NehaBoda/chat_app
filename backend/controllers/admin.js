import { adminSecretKey } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { cookieOptions } from "../utils/features.js";
import { ErrrorHandler } from "../utils/utility.js";
import JWT from "jsonwebtoken";

//To verify admin 
const  adminLogin =TryCatch(async(req,res,next)=>{
   const {secretKey}= req.body;

   const isMatched= secretKey === adminSecretKey;

   if(!isMatched) return next(new ErrrorHandler("Invalid admin key",401));

   const token = JWT.sign(secretKey,process.env.JWT_SECRET);

   return res.status(200)
   .cookie("chat-app-admin",token,{...cookieOptions,maxAge:1000*60*15,})
   .json({
       status:"success",
       message:"Admin logged in successfully"
   })
})

//To logOut
const  adminLogout =TryCatch(async(req,res,next)=>{
 
    return res.status(200)
    .cookie("chat-app-admin","",{...cookieOptions,maxAge:0,})
    .json({
        status:"success",
        message:"Logged Out succesfully"
    })
 })

//To get admin data 
const  getAdminData =TryCatch(async(req, res, next)=>{
    return res.status(200).json({
        status:"success",
        admin:true,
    })
 })

//to get all users 
const allusers= TryCatch (async (req, res) => {

    const users= await User.find({});

    const transformedUsers =await Promise.all( 
        users.map(async({name,username,avatar,_id})=>{

        const [groups,friends] =await Promise.all([
            Chat.countDocuments({groupChat: true, members:_id}),
            Chat.countDocuments({groupChat: false, users:_id})
        ])
        return {
            name,
            username,
            avatar:avatar.url,
            _id,
            groups,
            friends
        }

    }));
       
    
    res.status(200).json({
        status:"success",
         users:transformedUsers
    })
});

//To get all chats  
const allChats = TryCatch (async (req, res) => {

    const chats= await Chat.find({})
    .populate("members", "name avatar")
    .populate("creator", "name avatar");

    const transformedChats =await Promise.all(chats.map(async({members,_id,groupChat,name,creator})=>{

        const totalMessages =await Message.countDocuments({chat:_id});
        return {
            _id,
            groupChat,
            name,
            avatar:members.slice(0,3).map((member)=>member.avatar.url),
            members : members.map(({_id,name,avatar})=>(
                 {
                   _id,
                    name,
                    avatar:avatar.url
                }
            )),
            creator:{
                name:creator?.name || "None",
                avatar:creator?.avatar.url || ""
            },
            totalMembers:members.length,
            totalMessages,
}}) )


    res.status(200).json({
        status:"success",
         chats:transformedChats
    })
});

//To get all messages
const allMessages = TryCatch (async (req, res) => {

    const messages= await Message.find({})
    .populate("sender", "name avatar")
    .populate("chat", "groupChat");

    const transformedMessages =messages.map(({content,attachments,_id,sender,createdAt,chat})=>{
        return {
            _id,
            attachments,
            content,
            createdAt,
            chat: chat._id,
            groupChat:chat.groupChat,
            sender:{
                _id:sender._id,
                name:sender.name,
                avatar:sender.avatar.url
            },
        }
    })

    return res.status(200).json({
        status:"success",
         messages:transformedMessages
    })
});

//To check Stats
const getDashboardStates = TryCatch (async (req, res) => {

    const [groupCount , usersCount, messageCount ,totalChatsCount] =
    
    await Promise.all([
        Chat.countDocuments({groupChat: true}),
        User.countDocuments(),
        Message.countDocuments(),
        Chat.countDocuments()
    ]);

    const today =new Date();

    const last7Days =new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const last7DaysMessages = await Message.find({createdAt:{$gte:last7Days,$lte:today}})
    .select("createdAt");

    const messages =new Array(7).fill(0);

    const dayInMiliseconds =1000 * 60 * 60 * 24;

    last7DaysMessages.forEach((message)=>{
        const indexApprox =(today.getTime() - message.createdAt.getTime()) / dayInMiliseconds;
        const index =Math.floor(indexApprox);

       messages[6 - index]++;
    })
    

    const stats={
        groupCount,
        usersCount,
        messageCount,
        totalChatsCount,
        messageChart:messages,
    }



    return res.status(200).json({
        status:"success",
        stats,
    })
});

export {
    allusers,
    allChats,
    allMessages,
    getDashboardStates ,
    adminLogin,
    adminLogout,
    getAdminData
}