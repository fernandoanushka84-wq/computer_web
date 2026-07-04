"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, getToken } from "../../lib/api";

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetch(`${API_BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, []);

  const checkout = async () => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ shipping_address: address }),
    });
    if (!response.ok) {
      const body = await response.json();
      alert(body.detail || "Unable to place order");
      return;
    }

    localStorage.setItem("cartCount", "0");
    window.dispatchEvent(new Event("cart:update"));
    alert("Order placed successfully");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Checkout</p>
        <h1 className="text-4xl font-bold text-white">Your cart</h1>
        <p className="mt-3 text-slate-400">Secure delivery, fast support and a smooth purchase flow.</p>
      </div>
      <div className="rounded-4xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-950/20">
        {items.length === 0 ? (
          <p className="text-slate-300">Your cart is empty. Start shopping from the catalog.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-300">
                <span>Product #{item.product_id}</span>
                <span>Qty: {item.quantity}</span>
              </div>
            ))}
          </div>
        )}
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter delivery address" className="mt-6 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" />
        <button onClick={checkout} className="mt-4 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">Place order</button>
      </div>
    </div>
  );
}
