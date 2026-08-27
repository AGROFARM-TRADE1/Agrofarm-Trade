"use client";

import { useEffect, useState } from "react";

export default function OpeningSplash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-white">
      <div className="text-center">
        <div className="pulse-ring mx-auto mb-5 h-40 w-40 overflow-hidden rounded-full border border-farm-100 bg-white shadow-soft">
          <img src="/assets/agrofarm-logo.png" alt="Agrofarm-Trade logo" className="h-full w-full object-contain" />
        </div>
        <div className="text-2xl font-black tracking-[.22em] text-farm-800">AGROFARM-TRADE</div>
        <div className="mt-2 text-xs font-semibold tracking-[.35em] text-gold-600">FARM TODAY, TRADE TOMORROW</div>
        <div className="mx-auto mt-7 h-1 w-44 overflow-hidden rounded bg-farm-100">
          <div className="h-full w-1/2 animate-[slide_1.4s_ease-in-out_infinite] rounded bg-gold-500" />
        </div>
      </div>
      <style jsx>{`@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
    </div>
  );
}
