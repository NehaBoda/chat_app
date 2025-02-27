import multer from "multer";

const multerUpload=multer({
    limits:{
        fileSize: 1024* 1024* 5,
    },
});

const singleAvtar=multerUpload.single("avatar")

const attachmentsMulter=multerUpload.array("files",5)

export {singleAvtar,attachmentsMulter};