import { envMode } from "../app.js";

const errorMiddleware=(err,req,res,next)=>{

    err.message=err.message || "Internal Server Error";
    err.statusCode=err.statusCode || 500;

    if(err.code === 11000){
        const error = Object.keys(err.keyPattern).join(",")
         err.message = `Duplicate ${error} entered` ;
         err.statusCode = 400;
     }
     

     if (err.name === "CastError"){
        err.message =`Invalid ${err.path} entered` ;
        err.statusCode = 400;
    }
     
    return res.status(err.statusCode).json({
        success:false,
        message:envMode === "DEVELOPMENT" ? err: err.message,
    });
};
const TryCatch=(passedFunc)=>async (req,res,next) => {
    try{
        await passedFunc(req, res, next);
    }catch(error){
        next(error);
    }
 };
   


export {errorMiddleware, TryCatch};