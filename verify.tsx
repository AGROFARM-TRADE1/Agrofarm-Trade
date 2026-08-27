"use client";
import {useEffect,useState} from "react";
export default function Verify(){const [message,setMessage]=useState("Verifying...");useEffect(()=>{const token=new URLSearchParams(window.location.search).get("token");if(!token){setMessage("No verification token found.");return;}fetch(`${process.env.NEXT_PUBLIC_API_URL||"http://localhost:4000/api"}/auth/verify?token=${encodeURIComponent(token)}`).then(r=>r.json()).then(d=>setMessage(d.message||"Verification complete.")).catch(()=>setMessage("Verification failed."));},[]);return <p className="mt-4 text-sm text-slate-600">{message}</p>}
