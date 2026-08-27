const router=require("express").Router();
const multer=require("multer");
const path=require("path");
const fs=require("fs");
const crypto=require("crypto");
const prisma=require("../db");
const {auth}=require("../middleware/auth");

const uploadDir=path.join(process.cwd(),"uploads");
fs.mkdirSync(uploadDir,{recursive:true});
const storage=multer.diskStorage({
 destination:(_req,_file,cb)=>cb(null,uploadDir),
 filename:(_req,file,cb)=>cb(null,`${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});
const upload=multer({storage,limits:{fileSize:5*1024*1024}});

router.get("/me",auth,async(req,res)=>{
 const u=await prisma.user.findUnique({where:{id:req.user.id},select:{userId:true,referralCode:true,fullName:true,username:true,phone:true,email:true,plan:true,planExpiresAt:true,walletBalance:true,kycStatus:true,bankName:true,bankAccountNumber:true,bankAccountName:true,documents:true}});
 res.json(u);
});

router.post("/documents",auth,upload.single("document"),async(req,res)=>{
 if(!req.file||!req.body.type)return res.status(400).json({message:"Document type and file are required"});
 const doc=await prisma.document.create({data:{userId:req.user.id,type:String(req.body.type),fileUrl:`/uploads/${req.file.filename}`}});
 res.status(201).json(doc);
});

module.exports=router;
