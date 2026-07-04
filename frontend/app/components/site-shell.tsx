"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "../../lib/api";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const syncCartCount = () => {
    const count = Number(localStorage.getItem("cartCount") || 0);
    setCartCount(count);
  };

  useEffect(() => {
    syncCartCount();
    setIsLoggedIn(Boolean(getToken()));
    window.addEventListener("cart:update", syncCartCount);
    return () => window.removeEventListener("cart:update", syncCartCount);
  }, []);

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-semibold tracking-[0.2em] text-slate-950">
            NOVA PC HUB
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
            <Link href="/" className="transition hover:text-emerald-600">Home</Link>
            <Link href="/shop" className="transition hover:text-emerald-600">Shop</Link>
            <Link href="/cart" className="transition hover:text-emerald-600">Cart ({cartCount})</Link>
            {!isLoggedIn ? (
              <Link href="/login" className="rounded-full border border-slate-300 bg-slate-950 px-4 py-2 text-white transition hover:bg-emerald-600">Login</Link>
            ) : (
              <button onClick={handleLogout} className="rounded-full border border-slate-300 bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700">Logout</button>
            )}
          </nav>
          <button className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            Menu
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white/95 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm text-slate-700">
              <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link href="/shop" onClick={() => setMobileOpen(false)}>Shop</Link>
              <Link href="/cart" onClick={() => setMobileOpen(false)}>Cart ({cartCount})</Link>
              {!isLoggedIn ? (
                <Link href="/login" onClick={() => setMobileOpen(false)}>Login</Link>
              ) : (
                <button onClick={handleLogout} className="text-left text-emerald-600">Logout</button>
              )}
            </div>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600">
        <p>© 2026 NOVA PC HUB • Premium hardware • Secure checkout • WhatsApp +94 740620137</p>
      </footer>
    </div>
  );
}
