const prisma=require("../db");
const {getNumber}=require("./settings");
async function purchaseProduct(userId,productId){
  return prisma.$transaction(async tx=>{
    const user=await tx.user.findUnique({where:{id:userId}});
    const product=await tx.product.findUnique({where:{id:productId}});
    if(!user||!product||!product.active)throw new Error("Product unavailable");
    if(Number(user.walletBalance)<Number(product.price))throw new Error("Insufficient wallet balance");
    if(Number(product.stockPercent)<=0)throw new Error("Product is sold out");
    const threshold=await getNumber("HIGH_PRODUCT_PRICE_THRESHOLD");
    const grossRate=Number(product.price)>=threshold?await getNumber("HIGH_PRODUCT_PROFIT_RATE"):await getNumber("LOW_PRODUCT_PROFIT_RATE");
    const share=user.plan==="PREMIUM"?await getNumber("PREMIUM_USER_SHARE"):user.plan==="VIP"?await getNumber("VIP_USER_SHARE"):await getNumber("NORMAL_USER_SHARE");
    const gross=Number(product.price)*grossRate;
    const userProfit=gross*share;
    const companyShare=gross-userProfit;
    const cycleDays=Math.max(1,await getNumber("PRODUCT_CYCLE_DAYS"));
    const startAt=new Date();const endAt=new Date(startAt.getTime()+cycleDays*86400000);
    await tx.user.update({where:{id:userId},data:{walletBalance:{decrement:product.price}}});
    await tx.transaction.create({data:{userId,type:"INVESTMENT",status:"COMPLETED",amount:product.price,reference:`INV-${cryptoRandom()}`,note:`Purchased ${product.name}`} });
    const inv=await tx.investment.create({data:{userId,productId,principal:product.price,grossProfit:gross,userProfit,companyShare,startAt,endAt}});
    let stock=Number(product.stockPercent)-1;
    const priorPurchases=await tx.investment.count({where:{productId}});
    if(priorPurchases%2===0)stock-=1;
    stock=Math.max(0,stock);
    await tx.product.update({where:{id:productId},data:{stockPercent:stock}});
    if(user.referredById){
      const prior=await tx.transaction.findFirst({where:{userId:user.referredById,type:"REFERRAL"}});
      if(!prior){
        const reward=await getNumber("REFERRAL_REWARD");
        await tx.user.update({where:{id:user.referredById},data:{walletBalance:{increment:reward}}});
        await tx.transaction.create({data:{userId:user.referredById,type:"REFERRAL",status:"COMPLETED",amount:reward,reference:`REFERRAL-${user.id}`,note:`Qualified referral reward for ${user.userId}`}});
      }
    }
    return inv;
  });
}
function cryptoRandom(){return require("crypto").randomUUID();}
module.exports={purchaseProduct};
