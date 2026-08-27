const router=require("express").Router();
const prisma=require("../db");
const {auth}=require("../middleware/auth");
const {purchaseProduct}=require("../services/productService");
router.get("/",async(req,res)=>res.json(await prisma.product.findMany({where:{active:true,stockPercent:{gt:0}},orderBy:{price:"asc"}})));
router.post("/:id/purchase",auth,async(req,res)=>{try{const inv=await purchaseProduct(req.user.id,req.params.id);res.status(201).json(inv)}catch(e){res.status(400).json({message:e.message})}});
module.exports=router;
