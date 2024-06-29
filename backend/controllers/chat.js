import { ALERT,  NEW_MESSAGE, NEW_MESSAGE_ALERT, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMember } from "../lib/helper.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { deleteFilesFromCloudnary, emitEvent, uploadFilesToCloudnary } from "../utils/features.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js";
import { ErrrorHandler } from "../utils/utility.js";

// to craete new group 
const newGroupChat = TryCatch(async (req, res, next) => {
  const { name, members } = req.body;

  const allMembers = [...members, req.user];

  await Chat.create({
    name,
    groupChat: true,
    members: allMembers,
    creator: req.user,
  });

  emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
  emitEvent(req, REFETCH_CHATS, members);

  return res.status(201).json({
    success: true,
    message: "Group created successfully",
  });
});

//To get my chat
const getMyChats = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({
    members: req.user,
  }).populate("members", "name avatar");

  const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
    const otherMember = getOtherMember(members, req.user);

    return {
      _id,
      groupChat,
      avatar: groupChat
        ? members.slice(0, 3).map(({ avatar }) => avatar.url)
        : [otherMember.avatar.url],
      name: groupChat ? name : otherMember.name,
      members: members.reduce((prev, curr) => {
        if (curr._id.toString() !== req.user.toString()) {
          prev.push(curr._id);
        }
        return prev;
      }, []),
    };
  });

  return res.status(200).json({
    success: true,
    chats: transformedChats,
  });
});

// To get my groups 
const getMyGroups = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({
    groupChat: true,
    $or: [{ members: req.user }, { creator: req.user }],
  }).populate("members", "name avatar");

  const groups = chats.map(({ members, _id, groupChat, name }) => ({
    _id,
    groupChat,
    name,
    avatar: members.slice(0, 3).map(({ avatar }) => avatar?.url || ""),
  }));

  return res.status(200).json({
    success: true,
    groups,
  });
});

// To add new member in th group 
const addMembers = TryCatch(async (req, res, next) => {
  const { chatId, members } = req.body;


  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrrorHandler("Chat not found", 404));

  if (!chat.groupChat)
    return next(new ErrrorHandler("This is not a group chat", 400));

  if (chat.creator.toString() !== req.user.toString()) {
    return next(new ErrrorHandler("You are not allowed to add member", 403));
  }

  const allNewMembersPromise = members.map((i) => User.findById(i, "name"));

  const allNewMembers = await Promise.all(allNewMembersPromise);

  const uniqueMembers = allNewMembers
    .filter((i) => !chat.members.includes(i._id.toString()))
    .map((i) => i._id);

  chat.members.push(...uniqueMembers);

  if (chat.members.length > 150)
    return next(new ErrrorHandler("Group members can not be more than 150", 400));

  await chat.save();

  const allUsersName = allNewMembers.map((i) => i.name).join(", ");

  emitEvent(
    req,
    ALERT,
    chat.members,
    `${allUsersName} has been added to ${chat.name}`
  );

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Members added successfully",
  });
});

// To remove member from the group
const removeMember = TryCatch(async (req, res, next) => {

  const {userId, chatId} = req.body;

  const [chat, userThatWillBeRemoved]= await Promise.all([
    Chat.findById(chatId),
    User.findById(userId,"name")
  ]);

  if (!chat) return next(new ErrrorHandler("Chat not found", 404));

  if (!chat.groupChat)
    return next(new ErrrorHandler("This is not a group chat", 400));

  if (chat.creator.toString() !== req.user.toString()) {
    return next(new ErrrorHandler("You are not allowed to remove member", 403));
  }

  if(chat.members.length <= 3)
    return next(new ErrrorHandler("Group must have at least 3 members", 400));

  chat.members =chat.members.filter(
    (member)=>member.toString() !== userId.toString()
  
  );

  await chat.save();

  emitEvent(
    req,
    ALERT,
    chat.members,
    `${userThatWillBeRemoved.name} has been removed from the group`
  );

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Member removed successfully",
  });

})
 ;

// To leave Group 
const leaveGroup = TryCatch(async (req, res, next) => {
    
   const chatId =req.params.id;

  const chat = await Chat.findById(chatId);


  if (!chat) return next(new ErrrorHandler("Chat not found", 404));
  
  if (!chat.groupChat)
    return next(new ErrrorHandler("This is not a group chat", 400));

  const remainingMemembers =chat.members.filter(
    (member)=>member.toString() !== req.user.toString()
  );

  if (remainingMemembers.length < 3)
    return next(new ErrrorHandler("Group must have at least 3 members", 400));
 

  if (chat.creator.toString() === req.user.toString()){
    const randomElement = Math.floor(Math.random() * remainingMemembers.length);
    const newCreator = remainingMemembers[randomElement];
    chat.creator = newCreator;
  }

  chat.member = remainingMemembers;

  const [user] =await Promise.all([User.findById(req.user,"name"),chat.save()]);

  emitEvent(
    req,
    ALERT,
    chat.members,
    ` User ${user.name} has left the group`
  );

  return res.status(200).json({
    success: true,
    message: "Member removed successfully",
  });

})
 ;

//To send attachment
const sendAttachments = TryCatch(async(req,res,next)  =>{
   
  const {chatId} =req.body;

  const files =req.files || [];

  if (files.length < 1) return next (new ErrrorHandler("Please upload attachments", 400));

  if (files.length > 5 ) return next (new ErrrorHandler("Maximum 5 attachments can be uploaded", 400));

  const [chat,me] = await Promise.all([
    Chat.findById(chatId),
    User.findById(req.user, "name"),
  ]);

  if (!chat) return next(new ErrrorHandler("Chat not found", 404));


  if (files.length < 1)
    return next (new ErrrorHandler("Please provide files", 400));

  //upload files here

  const attachments = await uploadFilesToCloudnary(files);

  const messageForDB ={

    content: " ",
    attachments,
    sender:me._id,
    chat:chatId
  };

  const messageForRealTime={
    ...messageForDB,
    sender: {
      _id :me._id,
      name:me.name,
    }
  };

  const message =await Message.create(messageForDB);

  emitEvent(req,NEW_MESSAGE,chat.members,{
    message: messageForRealTime,
    chatId
  });

  emitEvent(req,NEW_MESSAGE_ALERT,chat.members,{
    chatId
  });
 

  return res.status(200).json({
    succes:true,
    message,
  })
});

// to get chat details
const getChatDetails =TryCatch(async(req,res,next)=>{

  if (req.query.populate ==="true"){
    const chat = await Chat.findById(req.params.id)
    .populate("members", "name avatar")
    .lean();
  
    if (!chat) return next(new ErrrorHandler("Chat not found", 404));

    chat.members = chat.members.map(({_id ,name,avatar})=>({
      _id,
      name,
      avatar:avatar.url,
    }));

    return res.status(200).json({
      success:true,
      chat,
    })
  }else{
    const chat = await Chat.findById(req.params.id);

    if (!chat) return next(new ErrrorHandler("Chat not found", 404));

    return res.status(200).json({
      success:true,
      chat,
    })

  }
});

// To rename group 
const renameGroup =TryCatch(async(req,res,next)=>{
  
  const chatId =req.params.id;
  const {name} =req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrrorHandler("Chat not found", 404));

  if (!chat.groupChat)
    return next(new ErrrorHandler("This is not a group chat", 400));

  if (chat.creator.toString() !== req.user.toString()) {
    return next(new ErrrorHandler("You are not allowed to rename group", 403));
  }

  chat.name =name;

  await chat.save();

  emitEvent (req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success:true,
    message:"Group name changed successfully",
  });;
});

// To delete chat 
const deleteChat =TryCatch(async(req, res, next)=>{

  const chatId =req.params.id;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrrorHandler("Chat not found", 404));

  
  const members =chat.members;

  if(chat.groupChat && chat.creator.toString() !== req.user.toString()){
    return next(new ErrrorHandler("You are not allowed to delete group", 403));
  }

  if (!chat.groupChat && !chat.members.includes(req.user.toString())){
    return next(new ErrrorHandler("You are not allowed to delete chat", 403));
  } 

  // here we have to all messages as well as attchments or files from cloudnary

  const messageWithAttachments = await Message.find({
    chat:chatId,
    attachments:{$exists:true,$ne:[] },
  });

  const publilc_ids=[];

  messageWithAttachments.forEach(({attachments})=>
    attachments.forEach(({public_id})=>publilc_ids.push(public_id))
   );
   
   await Promise.all([
    deleteFilesFromCloudnary(publilc_ids),chat.deleteOne(),
    Message.deleteMany({chat:chatId})
   ]);

   emitEvent(req , REFETCH_CHATS,members);


  return res.status(200).json({
    success:true,
    message:"Chat deleted successfully",
  });

});

//To get messages
const getMessages= TryCatch(async(req,res,next)=>{
  const chatId =req.params.id;

  const {page=1}=req.query;

  const resultPerPage=20;
  const skip=(page-1)*resultPerPage;

  const [messages,totalMessagesCount] = await Promise.all([
    Message.find({chat:chatId})
    .sort({createdAt:-1})
    .skip(skip)
    .limit(resultPerPage)
    .populate("sender", "name")
    .lean(),
    Message.countDocuments({chat:chatId}),
  ]);

  const totalPages=Math.ceil(totalMessagesCount / resultPerPage) || 0;

  return res.status(200).json({
    success:true,
    messages:messages.reverse(),
    totalPages,
  });
});

export {
   newGroupChat, 
   getMyChats, 
   getMyGroups, 
   addMembers ,
   removeMember ,
   leaveGroup,
   sendAttachments,
   getChatDetails,
   renameGroup,
   deleteChat,
   getMessages
  };

