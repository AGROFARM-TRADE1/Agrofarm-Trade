const nodemailer=require("nodemailer");
async function sendVerificationEmail(to, token){
  if(!process.env.SMTP_USER||!process.env.SMTP_PASS) return;
  const transporter=nodemailer.createTransport({host:process.env.SMTP_HOST||"smtp.gmail.com",port:Number(process.env.SMTP_PORT||465),secure:String(process.env.SMTP_SECURE||"true")==="true",auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
  const url=`${process.env.WEB_URL||"http://localhost:3000"}/verify-email?token=${encodeURIComponent(token)}`;
  await transporter.sendMail({from:process.env.SMTP_USER,to,subject:"Verify your Agrofarm-Trade email",html:`<p>Welcome to Agrofarm-Trade.</p><p>Verify your email to activate your account.</p><p><a href="${url}">Verify email</a></p>`});
}
module.exports={sendVerificationEmail};
