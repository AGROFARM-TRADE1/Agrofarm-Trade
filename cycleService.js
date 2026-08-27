const prisma=require("../db");
async function completeDueInvestments(){
 const due=await prisma.investment.findMany({where:{status:"ACTIVE",endAt:{lte:new Date()}},include:{user:true,product:true}});
 for(const inv of due){
  await prisma.$transaction(async tx=>{
   const exists=await tx.investment.findUnique({where:{id:inv.id}});
   if(!exists||exists.status!=="ACTIVE") return;
   const credit=Number(inv.principal)+Number(inv.userProfit);
   await tx.user.update({where:{id:inv.userId},data:{walletBalance:{increment:credit}}});
   await tx.transaction.create({data:{userId:inv.userId,type:"PROFIT",status:"COMPLETED",amount:credit,reference:`CYCLE-${inv.id}`,note:`Principal + user profit for ${inv.product.name}`}});
   await tx.investment.update({where:{id:inv.id},data:{status:"COMPLETED"}});
  });
 }
}
module.exports={completeDueInvestments};
