const {PrismaClient}=require("@prisma/client");
const bcrypt=require("bcryptjs");
const prisma=new PrismaClient();
const products=[
["Dried pepper",5000],["Soybeans",12000],["Bambara nuts",15000],["Sweet potatoes",18000],["Cassava",25000],["Garri",25000],["Hibiscus / Zobo dried flower",25000],["Groundnuts",28000],["Chilli pepper",30000],["Millet",32000],["Groundnut oil",35000],["Tomatoes",36000],["Sorghum / Guinea corn",36000],["Maize",38000],["Cowpea",40000],["Fonio",45000],["Egusi / Melon seed",50000],["Beans",55000],["Rice",65000],["Sesame / Beniseed",120000]
];
const settings={MIN_WITHDRAWAL:"10000",WITHDRAWAL_FEE_RATE:"0.005",REFERRAL_REWARD:"150",NORMAL_DAILY_RATE:"0.008",VIP_DAILY_RATE:"0.011",PREMIUM_DAILY_RATE:"0.015",VIP_PRICE:"30000",PREMIUM_PRICE:"100000",VIP_DURATION_DAYS:"365",PREMIUM_DURATION_DAYS:"365",PRODUCT_CYCLE_DAYS:"14",LOW_PRODUCT_PROFIT_RATE:"0.25",HIGH_PRODUCT_PROFIT_RATE:"0.35",HIGH_PRODUCT_PRICE_THRESHOLD:"36000",NORMAL_USER_SHARE:"0.70",VIP_USER_SHARE:"0.80",PREMIUM_USER_SHARE:"1.00",DEPOSIT_BANK_NAME:"Moniepoint",DEPOSIT_ACCOUNT_NUMBER:"6841233423"};
async function main(){
 const email=process.env.SEED_ADMIN_EMAIL||"admin@agrofarm-trade.example";
 const password=process.env.SEED_ADMIN_PASSWORD;
 if(!password) throw new Error("SEED_ADMIN_PASSWORD must be set before seeding the admin account");
 const hash=await bcrypt.hash(password,12);
 await prisma.user.upsert({where:{email},update:{passwordHash:hash,role:"ADMIN",emailVerified:true,status:"ACTIVE"},create:{userId:"AGF-ADMIN-0001",referralCode:"AGF-ADMIN",fullName:"Agrofarm Admin",username:"admin",phone:"0000000000",email,passwordHash:hash,emailVerified:true,role:"ADMIN"}});
 for(const [name,price] of products) await prisma.product.upsert({where:{id:`seed-${price}-${name.slice(0,5)}`},update:{name,price,expectedReturn:price>=36000?35:25,investmentDays:14,stockPercent:100,active:true},create:{id:`seed-${price}-${name.slice(0,5)}`,name,imageUrl:"/assets/agricultural-product-placeholder.svg",price,investmentDays:14,expectedReturn:price>=36000?35:25,stockPercent:100}});
 for(const [key,value] of Object.entries(settings)) await prisma.platformSetting.upsert({where:{key},create:{key,value},update:{value}});
 console.log(`Seeded admin ${email} and ${products.length} products.`);
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>prisma.$disconnect());
