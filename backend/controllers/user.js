import { compare } from "bcrypt";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Request } from "../models/request.js";
import { User } from "../models/user.js";
import { cookieOptions, emitEvent, sendToken, uploadFilesToCloudnary } from "../utils/features.js";
import { ErrrorHandler } from "../utils/utility.js";
import {getOtherMember} from "../lib/helper.js"



// Create a new user abd save it to the datbase and save it in cookie
const newUser= TryCatch(async(req,res,next)=>{

    const {name, username, password,bio}=req.body;

    const file =req.file;


    if(!file) return next (new ErrrorHandler("Please upload Avatar", 400));

    const result = await uploadFilesToCloudnary([file]);

    const avatar={
        public_id : result[0].public_id,
        url : result[0].url
    };
    const user= await User.create(
        {name,
        bio,
        username,
        password,
        avatar,
    });

   sendToken(res,user,201,"user created");
    
});

//login user and create cookie
const login=TryCatch(async(req,res,next)=>{
   
    const {username, password}= req.body;

    const user= await User.findOne({username}).select("+password");

    if (!user) return next ( new ErrrorHandler("Invalid Username OR password",404));

    const isMatch= await compare(password, user.password);

    if (!isMatch) return next ( new ErrrorHandler("Invalid Username OR password",404));

    sendToken(res,user,200,`welcome back ${user.name}`);


});

//get my profile
const getMyProfile= TryCatch(async(req, res,next)=>{

    const user= await User.findById(req.user);

    if (!user) return next (new ErrrorHandler("User not found", 404));
    
    res.status(200).json({
        success: true,
        user,
    });
    
});

//logout 
const logout= TryCatch(async(req, res)=>{
    res.status(200)
       .cookie("chat-app","",{  ...cookieOptions , maxAge:0})
       .json({ 
        success: true,
        message:"Logged out successfully"
    });
    
});

//to search user
const searchUser= TryCatch(async(req, res)=>{

    const {name= " "}=req.query;

    //finding all my chats
    const myChats =await Chat.find({groupChat:false,members: req.user});

    //extracting all users from my chat means friends or people i have chated with
    const allUsersFromMyChats =myChats.map((chat)=>chat.members).flat();

    //finding all users except me and friends
    const allUsersExceptMeAndFriends=await User.find({
        _id: {$nin: allUsersFromMyChats},
        name:{$regex: name, $options: "i"},
    })

    //modifying the response
    const users =allUsersExceptMeAndFriends.map(({_id,name,avatar})=>({
        _id,
        name,
        avatar:avatar.url,
    }));

    res.status(200).json({ 
        success: true,
        users
    });
    
});

//to send friend request
const sendRequest =TryCatch(async(req,res,next)=>{

    const {userId}= req.body;

    const request= await Request.findOne({
     $or:[
        {sender: req.user, receiver: userId},
        {sender: userId, receiver: req.user},
     ]
    })

    if (request) return  next (new ErrrorHandler("You have already sent a friend request", 400));

    await Request.create({
        sender: req.user,
        receiver: userId,
    });

    emitEvent(req,NEW_REQUEST,[userId])

    res.status(200).json({ 
     success: true,
     message:"Friend request sent"
 });
 
});

//to accept friend request
const acceptFriendRequest= TryCatch(async(req, res,next)=>{

    const {requestId,accept}=req.body;

    const request =await Request.findById(requestId)
      .populate("sender","name")
      .populate("receiver", "name");

    if (!request) return next (new ErrrorHandler("Request not found", 404));

    if (request.receiver._id.toString() !== req.user.toString()) 
        return next (new ErrrorHandler("You are not authorized to accept this request", 401));

    if (!accept) {
        await request.deleteOne();
        res.status(200).json({ 
            success: true,
            message:"Request rejected"
        });
    }

    const members =[request.sender._id, request.receiver._id];

    await Promise.all([
        Chat.create({
            members,
            name:`${request.sender.name}-${request.receiver.name}`
        }),
        request.deleteOne(),
    ])

    emitEvent(req,REFETCH_CHATS,members);

    res.status(200).json({ 
        success: true,
        message:"Friend request accepted",
        senderId: request.sender._id,
    });
    
});

// To get notifications 
const getNotifications= TryCatch(async(req, res)=>{
    const request= await Request.find({receiver: req.user}).populate("sender", "name avatar");

    const allRequest =request.map(({_id,sender})=>({
        _id,
        sender:{
        _id: sender._id,
        name: sender.name,
        avatar: sender.avatar.url,
        }
    }))

    
    return res.status(200).json({
        success: true,
        allRequest,
    });

})

// To get all my friends 
const getMyFriends= TryCatch(async(req, res)=>{

    const chatId=req.query.chatId;

    const chats= await Chat.find({members: req.user,groupChat:false}).populate("members", "name avatar");

    const friends =chats.map(({members})=>{
        const otherUser =getOtherMember(members, req.user);

        return {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar.url,
        }
    })

    if (chatId){
        const chat =await Chat.findById(chatId);

        const availableFriends =friends.filter(
            (friend)=> !chat.members.includes(friend._id)
        );
        return res.status(200).json({
            success: true,
            friends:availableFriends ,
        })
    }
    return res.status(200).json({
        success: true,
        friends,
    });

})

export { 
    getMyProfile, 
    login, 
    logout, 
    newUser, 
    searchUser, 
    sendRequest ,
    acceptFriendRequest,
    getNotifications,
    getMyFriends

};


