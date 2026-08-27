const router=require("express").Router();const prisma=require("../db");const {auth}=require("../middleware/auth");
router.get("/",auth,async(req,res)=>{const u=await prisma.user.findUnique({where:{id:req.user.id},select:{referralCode:true,referrals:{select:{userId:true,fullName:true,createdAt:true,investments:{select:{id:true},take:1}}}}});res.json(u)});
module.exports=router;
