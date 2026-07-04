"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const syncCartCount = () => {
    const count = Number(localStorage.getItem("cartCount") || 0);
    setCartCount(count);
  };

  useEffect(() => {
    syncCartCount();
    window.addEventListener("cart:update", syncCartCount);
    return () => window.removeEventListener("cart:update", syncCartCount);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_26%),linear-gradient(135deg,_#030712_0%,_#0f172a_45%,_#111827_100%)] text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-semibold tracking-[0.2em] text-cyan-300">
            NOVA PC HUB
          </Link>
          <nav className="hidden gap-6 text-sm text-slate-300 md:flex">
            <Link href="/" className="transition hover:text-cyan-300">Home</Link>
            <Link href="/shop" className="transition hover:text-cyan-300">Shop</Link>
            <Link href="/register" className="transition hover:text-cyan-300">Register</Link>
            <Link href="/cart" className="transition hover:text-cyan-300">Cart ({cartCount})</Link>
          </nav>
          <button className="rounded-full border border-cyan-400/40 px-3 py-2 text-sm text-cyan-200 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            Menu
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link href="/shop" onClick={() => setMobileOpen(false)}>Shop</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>Register</Link>
              <Link href="/cart" onClick={() => setMobileOpen(false)}>Cart ({cartCount})</Link>
            </div>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t border-white/10 bg-slate-950/60 px-4 py-10 text-center text-sm text-slate-400">
        <p>© 2026 NOVA PC HUB • Premium hardware • Secure checkout • WhatsApp +94 740620137</p>
      </footer>
    </div>
  );
}
