"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const addToCart = (productId: number) => {
    const count = Number(localStorage.getItem("cartCount") || 0) + 1;
    localStorage.setItem("cartCount", String(count));
    window.dispatchEvent(new Event("cart:update"));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Storefront</p>
        <h1 className="text-4xl font-bold text-white">All computer parts & systems</h1>
        <p className="mt-3 max-w-2xl text-slate-400">Curated gear for gaming, editing, business and everyday performance.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/75 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 p-4">
              <img src={product.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80"} alt={product.name} className="h-full w-full rounded-2xl object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="space-y-3 p-6">
              <h2 className="text-xl font-semibold text-white">{product.name}</h2>
              <p className="text-sm leading-7 text-slate-400">{product.description}</p>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Stock: {product.stock_quantity}</span>
                <span className="text-lg font-semibold text-cyan-300">LKR {product.price.toLocaleString()}</span>
              </div>
              <button onClick={() => addToCart(product.id)} className="w-full rounded-full bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400">Add to cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
