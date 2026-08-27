const prisma=require("../db");
const START=492601001n;
async function nextUserId(){
  const rows=await prisma.user.findMany({where:{userId:{startsWith:"AGF-"}},select:{userId:true}});
  let max=START-1n;
  for(const row of rows){
    const m=String(row.userId).match(/^AGF-(\d+)$/);
    if(m){const n=BigInt(m[1]);if(n>max)max=n;}
  }
  return `AGF-${(max+1n).toString()}`;
}
function referralCode(username){return `AGF-${username.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8)}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;}
module.exports={nextUserId,referralCode};
