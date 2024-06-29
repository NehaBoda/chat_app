
import { body, param, validationResult } from 'express-validator';
import { ErrrorHandler } from '../utils/utility.js';

const validateHandler =(req,res,next) =>{

    const errors= validationResult(req);
 
    const errorMessages = errors
    .array()
    .map((error) => error.msg)
    .join (",");  
    
    //console.log(errorMessages);
 
    if (errors.isEmpty())
        return next();
      else next (new ErrrorHandler(errorMessages, 400)) 
    
 };

const registerValidator =() =>[

    body ("name","please Enter Name").notEmpty(),
    body ("username","please Enter Username ").notEmpty(),
    body ("password","please Enter Password ").notEmpty(),
    body ("bio","please Enter Bio ").notEmpty(),
   
];



const loginValidator =() =>[

    body ("username","please Enter Username ").notEmpty(),
    body ("password","please Enter Password ").notEmpty(),
];

const newGroupValidator =() =>[

    body ("name","please Enter Name ").notEmpty(),
    body ("members")
        .notEmpty()
        .withMessage("Please Enter Member")
        .isArray({min:2,max:150})
        .withMessage("members must be between 2-100"),
];

const addMemberValidator =() =>[

    body ("chatId","please Enter chat ID").notEmpty(),
    body ("members")
        .notEmpty()
        .withMessage("Please Enter Member")
        .isArray({min:1,max:97})
        .withMessage("members must be between 1-97"),
]

const removeMemberValidator =() =>[

    body ("chatId","please Enter chat ID").notEmpty(),
    body ("userId","please Enter user Id").notEmpty()
]


const sendAttachmentsValidator =() =>[

    body("chatId","please Enter chat ID").notEmpty(),
]


const chatIdValidator =() =>[

    param("id", "please Enter chat ID").notEmpty(),
]

const renameGroupValidator =() =>[

    param("id", "please Enter chat ID").notEmpty(),
    body ("name", "please Enter New Name ").notEmpty(),
];

const sendRequestValidator =() =>[
 
    body ("userId", "please Enter user Id").notEmpty(),
];

const acceptRequestValidator =() =>[
 
    body ("requestId", "please Enter request Id").notEmpty(),
    body ("accept")
    .notEmpty()
    .withMessage("please Add Accept")
    .isBoolean()
    .withMessage("accept must be boolean")
    
];

const adminLoginValidator =() =>[
 
    body ("secretKey", "please Enter sekret Key").notEmpty()
    
]
 
    
export {
    acceptRequestValidator,
    addMemberValidator, 
    adminLoginValidator, 
    chatIdValidator, 
    loginValidator,
    newGroupValidator, 
    registerValidator, 
    removeMemberValidator, 
    renameGroupValidator, 
    sendAttachmentsValidator, 
    sendRequestValidator, 
    validateHandler
};
