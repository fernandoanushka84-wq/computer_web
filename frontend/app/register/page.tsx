"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });

  const register = async () => {
    const response = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    router.push("/shop");
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col justify-center px-4 py-20">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-cyan-950/20">
        <h1 className="text-3xl font-bold text-white">Create account</h1>
        <p className="mt-2 text-slate-400">Join NOVA PC HUB to save carts and place orders.</p>
        <input className="mt-6 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <textarea className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <button onClick={register} className="mt-6 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">Register</button>
      </div>
    </div>
  );
}
