const router=require("express").Router();
const multer=require("multer");
const path=require("path");
const fs=require("fs");
const crypto=require("crypto");
const prisma=require("../db");
const {auth,admin}=require("../middleware/auth");

const uploadDir=path.join(process.cwd(),"uploads");
fs.mkdirSync(uploadDir,{recursive:true});
const storage=multer.diskStorage({
  destination:(_req,_file,cb)=>cb(null,uploadDir),
  filename:(_req,file,cb)=>cb(null,`${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});
const upload=multer({storage,limits:{fileSize:5*1024*1024}});

router.use(auth,admin);

const decimal=(v)=>Number(v||0);
const cleanUser={id:true,userId:true,referralCode:true,fullName:true,username:true,email:true,phone:true,plan:true,planStartedAt:true,planExpiresAt:true,status:true,kycStatus:true,walletBalance:true,bankName:true,bankAccountNumber:true,bankAccountName:true,createdAt:true,updatedAt:true};

router.get("/dashboard",async(_req,res)=>{
  const [users,activeUsers,pendingDeposits,pendingWithdrawals,pendingKyc,pendingTasks,totalInvestments,totalDeposits,totalWithdrawals]=await Promise.all([
    prisma.user.count(),
    prisma.user.count({where:{status:"ACTIVE"}}),
    prisma.transaction.count({where:{type:"DEPOSIT",status:"PENDING"}}),
    prisma.transaction.count({where:{type:"WITHDRAWAL",status:"PENDING"}}),
    prisma.document.count({where:{status:"PENDING"}}),
    prisma.taskClaim.count({where:{status:"PENDING"}}),
    prisma.investment.count(),
    prisma.transaction.aggregate({where:{type:"DEPOSIT",status:"COMPLETED"},_sum:{amount:true}}),
    prisma.transaction.aggregate({where:{type:"WITHDRAWAL",status:"COMPLETED"},_sum:{amount:true}})
  ]);
  res.json({users,activeUsers,pendingDeposits,pendingWithdrawals,pendingKyc,pendingTasks,totalInvestments,totalDeposits:decimal(totalDeposits._sum.amount),totalWithdrawals:decimal(totalWithdrawals._sum.amount)});
});

router.get("/users",async(req,res)=>{
  const q=String(req.query.q||"").trim();
  res.json(await prisma.user.findMany({where:q?{OR:[{userId:{contains:q,mode:"insensitive"}},{fullName:{contains:q,mode:"insensitive"}},{email:{contains:q,mode:"insensitive"}},{username:{contains:q,mode:"insensitive"}}]}:{},select:cleanUser,orderBy:{createdAt:"desc"},take:200}));
});

router.get("/users/:id",async(req,res)=>{
  const user=await prisma.user.findUnique({where:{id:req.params.id},select:{...cleanUser,documents:true,investments:{include:{product:true},orderBy:{createdAt:"desc"}},transactions:{orderBy:{createdAt:"desc"},take:100},taskClaims:{include:{task:true},orderBy:{createdAt:"desc"}},supportTickets:{orderBy:{createdAt:"desc"}}}});
  if(!user)return res.status(404).json({message:"User not found"});
  res.json(user);
});

router.patch("/users/:id/status",async(req,res)=>{
  const status=String(req.body.status||"").toUpperCase();
  if(!["ACTIVE","SUSPENDED"].includes(status))return res.status(400).json({message:"Invalid status"});
  res.json(await prisma.user.update({where:{id:req.params.id},data:{status},select:cleanUser}));
});

router.patch("/users/:id/kyc",async(req,res)=>{
  const status=String(req.body.status||"").toUpperCase();
  if(!["PENDING","APPROVED","REJECTED"].includes(status))return res.status(400).json({message:"Invalid KYC status"});
  const user=await prisma.user.update({where:{id:req.params.id},data:{kycStatus:status},select:cleanUser});
  await prisma.document.updateMany({where:{userId:req.params.id},data:{status}});
  res.json(user);
});

router.patch("/users/:id/plan",async(req,res)=>{
  const plan=String(req.body.plan||"").toUpperCase();
  if(!["NORMAL","VIP","PREMIUM"].includes(plan))return res.status(400).json({message:"Invalid plan"});
  const now=new Date();
  const expires=plan==="NORMAL"?null:new Date(now.getTime()+365*86400000);
  res.json(await prisma.user.update({where:{id:req.params.id},data:{plan,planStartedAt:plan==="NORMAL"?null:now,planExpiresAt:expires},select:cleanUser}));
});

router.get("/documents",async(req,res)=>{
  const status=String(req.query.status||"PENDING").toUpperCase();
  const where=["PENDING","APPROVED","REJECTED"].includes(status)?{status}:{};
  res.json(await prisma.document.findMany({where,include:{user:{select:{userId:true,fullName:true,email:true}}},orderBy:{createdAt:"asc"},take:200}));
});

router.patch("/documents/:id",async(req,res)=>{
  const status=String(req.body.status||"").toUpperCase();
  if(!["PENDING","APPROVED","REJECTED"].includes(status))return res.status(400).json({message:"Invalid document status"});
  const doc=await prisma.document.update({where:{id:req.params.id},data:{status},include:{user:true}});
  const docs=await prisma.document.findMany({where:{userId:doc.userId}});
  const kyc=docs.length&&docs.every(d=>d.status==="APPROVED")?"APPROVED":docs.some(d=>d.status==="REJECTED")?"REJECTED":"PENDING";
  await prisma.user.update({where:{id:doc.userId},data:{kycStatus:kyc}});
  res.json(doc);
});

router.get("/products",async(_req,res)=>res.json(await prisma.product.findMany({orderBy:{price:"asc"}})));
router.post("/products",upload.single("image"),async(req,res)=>{
  const price=decimal(req.body.price);
  if(!req.body.name||price<=0)return res.status(400).json({message:"Product name and valid price are required"});
  const p=await prisma.product.create({data:{name:String(req.body.name).trim(),imageUrl:req.file?`/uploads/${req.file.filename}`:String(req.body.imageUrl||""),description:req.body.description||null,price,investmentDays:14,expectedReturn:price>=36000?35:25,stockPercent:100,active:req.body.active===undefined?true:String(req.body.active)==="true"}});
  res.status(201).json(p);
});
router.patch("/products/:id",upload.single("image"),async(req,res)=>{
  const data={};
  if(req.body.name!==undefined)data.name=String(req.body.name).trim();
  if(req.body.description!==undefined)data.description=req.body.description||null;
  if(req.body.price!==undefined){const price=decimal(req.body.price);if(price<=0)return res.status(400).json({message:"Invalid price"});data.price=price;data.expectedReturn=price>=36000?35:25;}
  if(req.body.stockPercent!==undefined)data.stockPercent=Math.max(0,Math.min(100,decimal(req.body.stockPercent)));
  if(req.body.active!==undefined)data.active=String(req.body.active)==="true";
  if(req.file)data.imageUrl=`/uploads/${req.file.filename}`;
  const p=await prisma.product.update({where:{id:req.params.id},data});
  res.json(p);
});
router.delete("/products/:id",async(req,res)=>{
  const count=await prisma.investment.count({where:{productId:req.params.id}});
  if(count)return res.status(409).json({message:"Product has investment history; deactivate it instead of deleting it"});
  await prisma.product.delete({where:{id:req.params.id}});res.json({message:"Product deleted"});
});

router.get("/investments",async(_req,res)=>res.json(await prisma.investment.findMany({include:{user:{select:{userId:true,fullName:true,email:true,plan:true}},product:true},orderBy:{createdAt:"desc"},take:300})));

router.get("/deposits",async(_req,res)=>res.json(await prisma.transaction.findMany({where:{type:"DEPOSIT"},include:{user:{select:{userId:true,fullName:true,email:true}}},orderBy:{createdAt:"desc"},take:300})));
router.post("/deposits/:id/approve",async(req,res)=>{
  const t=await prisma.$transaction(async tx=>{
    const row=await tx.transaction.findUnique({where:{id:req.params.id}});
    if(!row||row.type!=="DEPOSIT"||row.status!=="PENDING")throw new Error("Deposit is no longer pending");
    await tx.user.update({where:{id:row.userId},data:{walletBalance:{increment:row.amount}}});
    return tx.transaction.update({where:{id:row.id},data:{status:"COMPLETED",reviewedAt:new Date(),note:req.body.note||row.note}});
  });res.json(t);
});
router.post("/deposits/:id/reject",async(req,res)=>{
  const t=await prisma.transaction.update({where:{id:req.params.id,status:"PENDING"},data:{status:"REJECTED",reviewedAt:new Date(),note:req.body.note||null}});res.json(t);
});

router.get("/withdrawals",async(_req,res)=>res.json(await prisma.transaction.findMany({where:{type:"WITHDRAWAL"},include:{user:{select:{userId:true,fullName:true,email:true,bankName:true,bankAccountNumber:true,bankAccountName:true}}},orderBy:{createdAt:"desc"},take:300})));
router.post("/withdrawals/:id/complete",async(req,res)=>res.json(await prisma.transaction.update({where:{id:req.params.id,status:"PENDING"},data:{status:"COMPLETED",reviewedAt:new Date(),note:req.body.note||null}})));
router.post("/withdrawals/:id/reject",async(req,res)=>{
  const t=await prisma.$transaction(async tx=>{
    const row=await tx.transaction.findUnique({where:{id:req.params.id}});
    if(!row||row.type!=="WITHDRAWAL"||row.status!=="PENDING")throw new Error("Withdrawal is no longer pending");
    await tx.user.update({where:{id:row.userId},data:{walletBalance:{increment:row.amount.plus(row.fee)}}});
    return tx.transaction.update({where:{id:row.id},data:{status:"REJECTED",reviewedAt:new Date(),note:req.body.note||"Withdrawal rejected; funds returned"}});
  });res.json(t);
});

router.get("/tasks",async(_req,res)=>res.json(await prisma.task.findMany({include:{_count:{select:{claims:true}}},orderBy:{createdAt:"desc"}})));
router.post("/tasks",async(req,res)=>{
  const reward=decimal(req.body.reward);if(!req.body.title||reward<0)return res.status(400).json({message:"Task title and valid reward are required"});
  res.status(201).json(await prisma.task.create({data:{title:String(req.body.title),description:String(req.body.description||""),type:String(req.body.type||"OTHER").toUpperCase(),reward,vipOnly:Boolean(req.body.vipOnly),minTiktokFollowers:req.body.minTiktokFollowers?Number(req.body.minTiktokFollowers):null,minFacebookFollowers:req.body.minFacebookFollowers?Number(req.body.minFacebookFollowers):null}}));
});
router.patch("/tasks/:id",async(req,res)=>res.json(await prisma.task.update({where:{id:req.params.id},data:{...(req.body.title!==undefined?{title:req.body.title}:{}),...(req.body.description!==undefined?{description:req.body.description}:{}),...(req.body.reward!==undefined?{reward:decimal(req.body.reward)}:{}),...(req.body.vipOnly!==undefined?{vipOnly:Boolean(req.body.vipOnly)}:{}),...(req.body.status!==undefined?{status:String(req.body.status).toUpperCase()}: {})}})));
router.get("/task-claims",async(_req,res)=>res.json(await prisma.taskClaim.findMany({include:{task:true,user:{select:{userId:true,fullName:true,email:true,plan:true}}},orderBy:{createdAt:"desc"},take:300})));
router.post("/task-claims/:id/approve",async(req,res)=>{
  const result=await prisma.$transaction(async tx=>{
    const claim=await tx.taskClaim.findUnique({where:{id:req.params.id},include:{task:true}});
    if(!claim||claim.status!=="PENDING")throw new Error("Claim is no longer pending");
    await tx.user.update({where:{id:claim.userId},data:{walletBalance:{increment:claim.task.reward}}});
    await tx.transaction.create({data:{userId:claim.userId,type:"TASK",status:"COMPLETED",amount:claim.task.reward,reference:`TASK-${claim.id}`,note:`Approved task: ${claim.task.title}`}});
    return tx.taskClaim.update({where:{id:claim.id},data:{status:"COMPLETED"}});
  });res.json(result);
});
router.post("/task-claims/:id/reject",async(req,res)=>res.json(await prisma.taskClaim.update({where:{id:req.params.id,status:"PENDING"},data:{status:"REJECTED"}})));

router.get("/news",async(_req,res)=>res.json(await prisma.news.findMany({orderBy:{createdAt:"desc"}})));
router.post("/news",async(req,res)=>res.status(201).json(await prisma.news.create({data:{title:String(req.body.title||""),body:String(req.body.body||""),imageUrl:req.body.imageUrl||null,published:req.body.published===undefined?true:Boolean(req.body.published)}})));
router.patch("/news/:id",async(req,res)=>res.json(await prisma.news.update({where:{id:req.params.id},data:{...(req.body.title!==undefined?{title:req.body.title}:{}),...(req.body.body!==undefined?{body:req.body.body}:{}),...(req.body.imageUrl!==undefined?{imageUrl:req.body.imageUrl||null}:{}),...(req.body.published!==undefined?{published:Boolean(req.body.published)}:{})}})));
router.delete("/news/:id",async(req,res)=>{await prisma.news.delete({where:{id:req.params.id}});res.json({message:"News deleted"})});

router.get("/tickets",async(_req,res)=>res.json(await prisma.supportTicket.findMany({include:{user:{select:{userId:true,fullName:true,email:true}}},orderBy:{updatedAt:"desc"},take:300})));
router.patch("/tickets/:id",async(req,res)=>res.json(await prisma.supportTicket.update({where:{id:req.params.id},data:{...(req.body.status!==undefined?{status:String(req.body.status).toUpperCase()}:{}),...(req.body.response!==undefined?{response:String(req.body.response)}:{})}})));

router.get("/transactions",async(_req,res)=>res.json(await prisma.transaction.findMany({include:{user:{select:{userId:true,fullName:true,email:true}}},orderBy:{createdAt:"desc"},take:500})));

const DEFAULT_SETTINGS={
  MIN_WITHDRAWAL:"10000",
  WITHDRAWAL_FEE_RATE:"0.005",
  REFERRAL_REWARD:"150",
  NORMAL_DAILY_RATE:"0.008",
  VIP_DAILY_RATE:"0.011",
  PREMIUM_DAILY_RATE:"0.015",
  VIP_PRICE:"30000",
  PREMIUM_PRICE:"100000",
  VIP_DURATION_DAYS:"365",
  PREMIUM_DURATION_DAYS:"365",
  PRODUCT_CYCLE_DAYS:"14",
  LOW_PRODUCT_PROFIT_RATE:"0.25",
  HIGH_PRODUCT_PROFIT_RATE:"0.35",
  HIGH_PRODUCT_PRICE_THRESHOLD:"36000",
  NORMAL_USER_SHARE:"0.70",
  VIP_USER_SHARE:"0.80",
  PREMIUM_USER_SHARE:"1.00",
  DEPOSIT_BANK_NAME:"Moniepoint",
  DEPOSIT_ACCOUNT_NUMBER:"6841233423"
};

router.get("/settings",async(_req,res)=>{
 const rows=await prisma.platformSetting.findMany({orderBy:{key:"asc"}});
 const settings={...DEFAULT_SETTINGS};
 for(const row of rows) settings[row.key]=row.value;
 res.json(settings);
});
const NUMERIC_SETTINGS=new Set([
 "MIN_WITHDRAWAL","WITHDRAWAL_FEE_RATE","REFERRAL_REWARD",
 "NORMAL_DAILY_RATE","VIP_DAILY_RATE","PREMIUM_DAILY_RATE",
 "VIP_PRICE","PREMIUM_PRICE","VIP_DURATION_DAYS","PREMIUM_DURATION_DAYS",
 "PRODUCT_CYCLE_DAYS","LOW_PRODUCT_PROFIT_RATE","HIGH_PRODUCT_PROFIT_RATE",
 "HIGH_PRODUCT_PRICE_THRESHOLD","NORMAL_USER_SHARE","VIP_USER_SHARE","PREMIUM_USER_SHARE"
]);

router.put("/settings",async(req,res)=>{
 const allowed=new Set(Object.keys(DEFAULT_SETTINGS));
 const entries=[];
 for(const [key,value] of Object.entries(req.body||{})){
   if(!allowed.has(key)||value===undefined||value===null) continue;
   if(NUMERIC_SETTINGS.has(key)){
     const n=Number(value);
     if(!Number.isFinite(n)||n<0) return res.status(400).json({message:`Invalid value for ${key}`});
     if(key.endsWith("_RATE") && n>1) return res.status(400).json({message:`${key} must be between 0 and 1`});
     if(key.endsWith("_SHARE") && n>1) return res.status(400).json({message:`${key} must be between 0 and 1`});
   }
   entries.push([key,String(value)]);
 }
 await prisma.$transaction(entries.map(([key,value])=>prisma.platformSetting.upsert({where:{key},create:{key,value},update:{value}})));
 const rows=await prisma.platformSetting.findMany({orderBy:{key:"asc"}});
 const settings={...DEFAULT_SETTINGS};for(const row of rows)settings[row.key]=row.value;
 res.json(settings);
});

module.exports=router;
