"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-farm-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-3">
          <img src="/assets/agrofarm-logo.png" alt="Agrofarm-Trade" className="h-12 w-12 object-contain" />
          <div>
            <div className="font-black tracking-tight text-farm-800">AGROFARM<span className="text-gold-600">-TRADE</span></div>
            <div className="hidden text-[9px] font-bold tracking-[.2em] text-farm-600 sm:block">FARM TODAY, TRADE TOMORROW</div>
          </div>
        </Link>
        <button className="rounded-lg border border-farm-100 px-3 py-2 md:hidden" onClick={() => setOpen(!open)}>Menu</button>
        <nav className={`${open ? "absolute left-0 right-0 top-[73px] flex" : "hidden"} flex-col gap-4 border-b bg-white p-5 md:static md:flex md:flex-row md:items-center md:border-0 md:p-0`}>
          <a href="#how" className="text-sm font-semibold text-slate-600 hover:text-farm-700">How it works</a>
          <a href="#products" className="text-sm font-semibold text-slate-600 hover:text-farm-700">Products</a>
          <a href="#plans" className="text-sm font-semibold text-slate-600 hover:text-farm-700">Plans</a>
          <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-bold text-farm-700">Login</Link>
          <Link href="/register" className="rounded-xl bg-farm-700 px-5 py-2.5 text-sm font-bold text-white shadow-soft hover:bg-farm-800">Create account</Link>
        </nav>
      </div>
    </header>
  );
}
