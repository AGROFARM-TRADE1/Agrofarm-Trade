require("dotenv").config();
const express=require("express");const cors=require("cors");const helmet=require("helmet");
const app=express();app.use(helmet());app.use(cors({origin:true,credentials:true}));app.use(express.json({limit:"2mb"}));app.use(express.urlencoded({extended:true}));
app.use("/uploads",express.static("uploads"));
app.use("/api/health",require("./routes/health"));
app.use("/api/auth",require("./routes/auth"));
app.use("/api/user",require("./routes/user"));
app.use("/api/account",require("./routes/account"));
app.use("/api/products",require("./routes/products"));
app.use("/api/wallet",require("./routes/wallet"));
app.use("/api/referrals",require("./routes/referrals"));
app.use("/api/tasks",require("./routes/tasks"));
app.use("/api/admin",require("./routes/admin"));

// Keep API failures JSON-shaped so the frontend never has to parse an HTML error page.
app.use((err,req,res,next)=>{
  console.error(err);
  if(res.headersSent) return next(err);
  const status=Number(err.statusCode||err.status||500);
  res.status(status>=400&&status<600?status:500).json({message:status===500?"Internal server error":(err.message||"Request failed")});
});

const {completeDueInvestments}=require("./services/cycleService");
setInterval(()=>completeDueInvestments().catch(console.error),60_000);
const port=Number(process.env.PORT||4000);
app.listen(port,()=>console.log(`Agrofarm-Trade API listening on ${port}`));
