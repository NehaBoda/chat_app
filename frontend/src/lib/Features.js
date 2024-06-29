import moment from "moment";

const fileFormat=(url="")=>{


    const fileExtention=url.split(".").pop()

    if(fileExtention==="mp4"||fileExtention==="webm"||fileExtention==="ogg")
        return "video";

    if(fileExtention==="mp3"||fileExtention==="mav")
            return "audio";
    
    if(fileExtention==="png"||
    fileExtention==="jpg"||
    fileExtention==="jpeg"||
    fileExtention==="gif")
            return "image";
    
    return"file";

};

//https://res.cloudinary.com/dgqms9tmg/image/upload/v1719129146/562445d6-2bf2-45cf-9926-68a9ab5a3f20.jpg
const transformImage=(url="",width=100)=>{
    

    // if (typeof url !== "string" || !url) {
    //     console.error("Invalid URL provided:", url);
    //     return "";
    // }

    // const newUrl =url.replace("upload/",`upload/dpr_auto/w_${width}/`);
    // return newUrl;
    return url;
}

const getLast7Days=()=>{
 const currentDate=moment();

 const last7Days=[];

 for(let i=0;i<7;i++){
    const dayDate=currentDate.clone().subtract(i,'days');
    const dayName=dayDate.format('dddd');
    last7Days.unshift(dayName);
 }
 return last7Days;
};

const getOrSaveFromStorage = ({ key,value,get })=>{
   if (get) return localStorage.getItem(key)
    ? JSON.parse(localStorage.getItem(key))
    :null;
    else localStorage.setItem(key, JSON.stringify(value));
}


export{fileFormat,transformImage,getLast7Days,getOrSaveFromStorage};