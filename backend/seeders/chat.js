import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import {User} from "../models/user.js";
import {faker, simpleFaker} from "@faker-js/faker";

const createSingleChats =async(numChats) => {
    try{
        const users =await User.find().select("_id");

        const chatsPromise =[];

        for (let i=0; i< users.length ; i++){
            for(let j=i+1; j < users.length ; j++){
                chatsPromise.push(
                    Chat.create({
                       name:faker.lorem.sentence(3),
                        members:[users[i],users[j]]
                    })
                )
            }
        }

        await Promise.all(chatsPromise);

        console.log("Single chats created ");
        process.exit();
    }catch(error){
        console.error(error);
        process.exit(1);

    }

};

const createGroupsChats =async(numChats) => {
    try{
        const users =await User.find().select("_id");

        const chatsPromise =[];

        for (let i=0; i< numChats ; i++){
           const numMembers =simpleFaker.number.int({ min:3, max:users.length});
           const members =[];

           for (let j=0; j< numMembers; j++){
               const randomIndex =Math.floor(Math.random() * users.length);
               const randomUser =users[randomIndex];

               // To ensure the same user is not added twice
               if (!members.includes(randomUser)){
                   members.push(randomUser);
               }
           }
           const chat =Chat.create({
            groupChat : true,
            name:faker.lorem.words(1),
            members,
            creator: members[0]
           });
           chatsPromise.push(chat);

        }
        await Promise.all(chatsPromise);

        console.log("chats created succesfully ");
        process.exit();

    }catch(error){
        console.error(error);
        process.exit(1);

    }
};

const createMessages =async (numMessages)=>{
    try{
      const users =await User.find().select("_id");
      const chats =await Chat.find().select("_id"); 

      const messagesPromise =[];
      for (let i=0; i< numMessages; i++){
          const randomIndex =Math.floor(Math.random() * users.length);
          const randomUser =users[randomIndex];

          const randomIndex2 =Math.floor(Math.random() * chats.length);
          const randomChat =chats[randomIndex2];

          messagesPromise.push(
              Message.create({
                  content:faker.lorem.sentence(),
                  sender:randomUser,
                  chat:randomChat
              })
          )
      }
      await Promise.all(messagesPromise);
      console.log("Messages created succesfully ");
      process.exit();

    }catch{
        console.error(error);
        process.exit(1);
    }
};

const createMessagesInAChat =async (chatId, numMessages)=>{
    try{
      const users =await User.find().select("_id");
      const chats =await Chat.find().select("_id"); 

      const messagesPromise =[];
      for (let i=0; i< numMessages; i++){
          const randomIndex =Math.floor(Math.random() * users.length);
          const randomUser =users[randomIndex];


          messagesPromise.push(
              Message.create({
                  content:faker.lorem.sentence(),
                  sender:randomUser,
                  chat:chatId
              })
          )
      }
      await Promise.all(messagesPromise);
      console.log("Messages created succesfully ");
      process.exit();

    }catch{
        console.error(error);
        process.exit(1);
    }
};
export {createSingleChats,createGroupsChats,createMessages,createMessagesInAChat}
