"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });

  const login = async () => {
    const response = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    router.push("/admin");
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col justify-center px-4 py-20">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-cyan-950/20">
        <h1 className="text-3xl font-bold text-white">Secure customer login</h1>
        <p className="mt-2 text-slate-400">Sign in to view orders and keep your shopping profile synced.</p>
        <input className="mt-6 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button onClick={login} className="mt-6 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">Login</button>
      </div>
    </div>
  );
}
