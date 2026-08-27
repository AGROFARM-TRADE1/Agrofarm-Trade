"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

export function RegisterForm() {
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false); const router=useRouter();
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setError(""); setLoading(true);
    const fd=new FormData(e.currentTarget); const body=Object.fromEntries(fd.entries());
    try { await api("/auth/register",{method:"POST",body:JSON.stringify(body)}); router.push("/verify-email"); }
    catch(err){setError(err instanceof Error?err.message:"Registration failed");} finally{setLoading(false);}
  }
  return <form onSubmit={submit} className="space-y-4">
    {["fullName","username","phone","email","password","confirmPassword","referralCode"].map((name)=><input key={name} name={name} type={name.toLowerCase().includes("password")?"password":"text"} required={name!=="referralCode"} placeholder={name==="referralCode"?"Referral code (optional)":name.replace(/([A-Z])/g," $1")} className="w-full rounded-xl border border-farm-100 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-farm-200"/>)}
    {error&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={loading} className="w-full rounded-xl bg-farm-700 px-4 py-3.5 font-bold text-white disabled:opacity-50">{loading?"Creating...":"Create account"}</button>
  </form>;
}

export function LoginForm() {
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false); const router=useRouter();
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError("");setLoading(true);const body=Object.fromEntries(new FormData(e.currentTarget).entries());try{const d=await api<{token:string}>("/auth/login",{method:"POST",body:JSON.stringify(body)});localStorage.setItem("agf_token",d.token);router.push("/dashboard");}catch(err){setError(err instanceof Error?err.message:"Login failed")}finally{setLoading(false)}}
  return <form onSubmit={submit} className="space-y-4">
    <input name="email" type="email" required placeholder="Gmail address" className="w-full rounded-xl border border-farm-100 px-4 py-3"/>
    <input name="password" type="password" required placeholder="Password" className="w-full rounded-xl border border-farm-100 px-4 py-3"/>
    {error&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={loading} className="w-full rounded-xl bg-farm-700 px-4 py-3.5 font-bold text-white">{loading?"Signing in...":"Login"}</button>
  </form>;
}
