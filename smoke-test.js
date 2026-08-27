const fs=require("fs");
const path=require("path");
const {execFileSync}=require("child_process");

const root=path.join(__dirname,"..");
const required=[
  "api/src/server.js","api/src/routes/admin.js","api/prisma/schema.prisma",
  "web/app/admin/page.tsx","web/lib/api.ts",".github/workflows/deploy-pages.yml",
  "api/.env.example","web/.env.example"
];
for(const file of required){
  if(!fs.existsSync(path.join(root,file))) throw new Error(`Missing required file: ${file}`);
}
for(const file of fs.readdirSync(path.join(__dirname,"src"),{recursive:true}).filter(f=>f.endsWith(".js"))){
  const full=path.join(__dirname,"src",file);
  execFileSync(process.execPath,["--check",full],{stdio:"pipe"});
}
const admin=fs.readFileSync(path.join(__dirname,"src/routes/admin.js"),"utf8");
const web=fs.readFileSync(path.join(root,"web/app/admin/page.tsx"),"utf8");
const env=fs.readFileSync(path.join(__dirname,".env.example"),"utf8");
const gitignore=fs.readFileSync(path.join(root,".gitignore"),"utf8");
const endpoints=[
  "/dashboard","/users","/documents","/products","/investments","/deposits","/withdrawals",
  "/tasks","/task-claims","/news","/tickets","/transactions","/settings"
];
for(const endpoint of endpoints){
  if(!admin.includes(`"${endpoint}`)) throw new Error(`Admin endpoint missing: ${endpoint}`);
}
for(const route of ["/admin/dashboard","/admin/products","/admin/tasks","/admin/news","/admin/settings","/admin/users/"]){
  if(!web.includes(route)) throw new Error(`Admin UI route not wired: ${route}`);
}
if(!/\.env\.\*/.test(gitignore) || !/!\.env\.example/.test(gitignore)) throw new Error("Environment-file ignore rules are missing");
const secretLines=env.split(/\r?\n/).filter(line=>/^(DATABASE_URL|JWT_SECRET|SMTP_PASS)=/.test(line));
for(const line of secretLines){
  const value=line.split("=").slice(1).join("=").trim();
  if(!value || !["password","replace-with-a-long-random-secret","your-gmail-app-password"].includes(value) && !value.includes("localhost")) throw new Error("Potential real secret in .env.example");
}
console.log(`Smoke test passed: ${required.length} required files, ${endpoints.length} admin areas, and all API JS syntax checks are valid.`);
