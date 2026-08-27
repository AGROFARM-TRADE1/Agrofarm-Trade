const jwt = require("jsonwebtoken");
const prisma = require("../db");

async function auth(req,res,next){
  try{
    const header=req.headers.authorization||"";
    const token=header.startsWith("Bearer ")?header.slice(7):null;
    if(!token) return res.status(401).json({message:"Authentication required"});
    const payload=jwt.verify(token,process.env.JWT_SECRET);
    const user=await prisma.user.findUnique({where:{id:payload.sub}});
    if(!user||user.status!=="ACTIVE") return res.status(401).json({message:"Account unavailable"});
    req.user=user; next();
  }catch(e){return res.status(401).json({message:"Invalid or expired session"});}
}
function admin(req,res,next){if(req.user?.role!=="ADMIN")return res.status(403).json({message:"Admin access required"});next();}
module.exports={auth,admin};
