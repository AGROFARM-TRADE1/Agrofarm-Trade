import Link from "next/link";
import OpeningSplash from "./OpeningSplash";
import Header from "./Header";

const products = [
  ["Dried pepper","₦5,000"],["Soybeans","₦12,000"],["Bambara nuts","₦15,000"],
  ["Sweet potatoes","₦18,000"],["Cassava","₦25,000"],["Garri","₦25,000"],
  ["Hibiscus / Zobo","₦25,000"],["Groundnuts","₦28,000"],["Chilli pepper","₦30,000"],
  ["Millet","₦32,000"],["Groundnut oil","₦35,000"],["Tomatoes","₦36,000"],
  ["Sorghum / Guinea corn","₦36,000"],["Maize","₦38,000"],["Cowpea","₦40,000"],
  ["Fonio","₦45,000"],["Egusi / Melon seed","₦50,000"],["Beans","₦55,000"],
  ["Rice","₦65,000"],["Sesame / Beniseed","₦120,000"]
];

export default function Landing() {
  return (
    <>
      <OpeningSplash />
      <Header />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-farm-900 via-farm-800 to-farm-700 px-5 py-20 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div className="float-in">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest">Agriculture • Trade • Opportunity</span>
              <h1 className="mt-7 text-5xl font-black leading-[1.02] sm:text-6xl">Farm today.<br /><span className="text-gold-400">Trade tomorrow.</span></h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">A modern platform for agricultural products, trading opportunities, digital tasks and account management.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="rounded-2xl bg-gold-500 px-6 py-3.5 font-bold text-white hover:bg-gold-600">Get started</Link>
                <Link href="/login" className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 font-bold text-white hover:bg-white/15">Login</Link>
              </div>
              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {[[`20+`,`products`],[`14`,`day cycle`],[`₦10k`,`min. withdrawal`]].map(([a,b])=><div key={b} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-2xl font-black">{a}</div><div className="mt-1 text-xs text-white/60">{b}</div></div>)}
              </div>
            </div>
            <div className="mx-auto w-full max-w-lg">
              <div className="glass rounded-[2rem] p-4 shadow-2xl">
                <div className="rounded-[1.5rem] bg-white p-6 text-slate-900">
                  <img src="/assets/agrofarm-logo.png" alt="Agrofarm-Trade logo" className="mx-auto h-52 w-52 object-contain" />
                  <div className="mt-3 text-center text-2xl font-black text-farm-800">Agrofarm-Trade</div>
                  <div className="mt-2 text-center text-xs font-bold tracking-[.3em] text-gold-600">FARM TODAY, TRADE TOMORROW</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-7xl px-5 py-20">
          <div className="max-w-2xl"><p className="font-bold uppercase tracking-widest text-gold-600">Simple journey</p><h2 className="mt-2 text-4xl font-black text-farm-900">Everything in one dashboard.</h2></div>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              ["01","Create account","Register and verify your Gmail."],
              ["02","Fund wallet","Make a bank transfer and upload proof."],
              ["03","Choose product","Purchase an available agricultural product."],
              ["04","Track & withdraw","Monitor your investment and eligible wallet balance."]
            ].map(([n,t,d])=><div key={n} className="rounded-3xl border border-farm-100 bg-white p-7 shadow-soft"><div className="text-sm font-black text-gold-600">{n}</div><h3 className="mt-4 text-xl font-black text-farm-900">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{d}</p></div>)}
          </div>
        </section>

        <section id="products" className="bg-farm-50 px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-bold uppercase tracking-widest text-gold-600">Agricultural products</p><h2 className="mt-2 text-4xl font-black text-farm-900">Current catalogue</h2></div><Link href="/register" className="font-bold text-farm-700">Open account →</Link></div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map(([name,price])=><div key={name} className="rounded-2xl border border-farm-100 bg-white p-5"><div className="text-sm font-bold text-farm-700">{name}</div><div className="mt-3 text-2xl font-black text-slate-900">{price}</div><div className="mt-2 text-xs font-semibold text-slate-400">50kg • 14-day cycle</div></div>)}
            </div>
          </div>
        </section>

        <section id="plans" className="mx-auto max-w-7xl px-5 py-20">
          <div className="text-center"><p className="font-bold uppercase tracking-widest text-gold-600">Account plans</p><h2 className="mt-2 text-4xl font-black text-farm-900">Choose your level</h2></div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Normal","0.8%","70 / 30","Standard account"],
              ["VIP","1.1%","80 / 20","₦30,000 • yearly"],
              ["Premium","1.5%","100 / 0","₦100,000 • yearly"]
            ].map(([name,rate,share,desc],i)=><div key={name} className={`rounded-3xl border p-8 shadow-soft ${i===1?"border-gold-400 bg-farm-900 text-white":"border-farm-100 bg-white"}`}><div className="flex items-center justify-between"><h3 className="text-2xl font-black">{name}</h3>{i===1&&<span className="rounded-full bg-gold-500 px-3 py-1 text-xs font-black">POPULAR</span>}</div><div className="mt-7 text-4xl font-black">{rate}</div><div className="mt-1 text-sm opacity-60">daily rate setting</div><div className="mt-7 border-t pt-5 text-sm opacity-80">{desc}</div><div className="mt-3 text-sm font-bold">Profit share: {share}</div></div>)}
          </div>
        </section>

        <section className="bg-farm-900 px-5 py-20 text-white"><div className="mx-auto max-w-4xl text-center"><h2 className="text-4xl font-black">Build your agricultural journey.</h2><p className="mx-auto mt-4 max-w-2xl text-white/65">Create an account, explore available products, manage your wallet and stay connected with Agrofarm-Trade.</p><Link href="/register" className="mt-8 inline-block rounded-2xl bg-gold-500 px-7 py-3.5 font-bold hover:bg-gold-600">Create account</Link></div></section>
      </main>
      <footer className="bg-white px-5 py-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-slate-500 sm:flex-row"><span>© {new Date().getFullYear()} Agrofarm-Trade</span><span>Farm Today, Trade Tomorrow</span></div></footer>
    </>
  );
}
