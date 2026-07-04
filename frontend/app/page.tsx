"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "./../lib/api";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  slug: string;
}

const heroImages = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1587202372614-c3f3d0f8f0b2?auto=format&fit=crop&w=1200&q=80",
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setHeroIndex((prev) => (prev + 1) % heroImages.length), 4000);
    return () => window.clearInterval(timer);
  }, []);

  const addToCart = (productId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch(`${API_BASE_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId, quantity: 1 }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to add to cart");
        const count = Number(localStorage.getItem("cartCount") || 0) + 1;
        localStorage.setItem("cartCount", String(count));
        window.dispatchEvent(new Event("cart:update"));
      })
      .catch(() => window.location.href = "/login");
  };

  return (
    <div className="pb-20">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-emerald-200/70 bg-emerald-100/70 px-3 py-1 text-sm font-medium text-emerald-700 animate-glow">
            Premium IT Partner for creators, gamers & businesses
          </div>
          <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Build a powerhouse setup with style, speed and confidence.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-700">
            Discover laptops, desktops, processors, GPUs, storage and accessories with fast delivery, expert support and warranty-friendly service.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/shop" className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700">Shop Now</Link>
            <a href="https://wa.me/94740620137" target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-950 transition hover:border-emerald-500 hover:text-emerald-700">WhatsApp Us</a>
          </div>
          <div className="flex flex-wrap gap-3 pt-2 text-sm text-slate-400">
            <span className="rounded-full border border-white/10 px-3 py-1">Same-day dispatch</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Trusted brands</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Expert support</span>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 animate-floaty">
          <img src={heroImages[heroIndex]} alt="computer hardware showcase" className="h-[420px] w-full object-cover transition duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-700">Featured build</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">A sleek creator-gamer rig with next-gen performance</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: 'Custom PC Builds', text: 'Tailored systems for gaming, editing and business productivity.' },
            { title: 'Expert Support', text: 'Professional advice for choosing the right parts and upgrade path.' },
            { title: 'Warranty Protection', text: 'Reliable after-sales support and warranty assistance in Sri Lanka.' },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">New arrivals</p>
            <h2 className="text-3xl font-semibold text-white">Fresh products landing this week</h2>
          </div>
          <Link href="/shop" className="text-sm font-medium text-cyan-300">View all</Link>
        </div>
        {loading ? (
          <p className="text-slate-300">Loading products...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.slice(0, 6).map((product) => (
              <div key={product.id} className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 p-4">
                  <img src={product.image_url || heroImages[0]} alt={product.name} className="h-full w-full rounded-2xl object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="space-y-3 p-6">
                  <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                  <p className="text-sm leading-7 text-slate-400">{product.description}</p>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Stock: {product.stock_quantity}</span>
                    <span className="text-lg font-semibold text-cyan-300">LKR {product.price.toLocaleString()}</span>
                  </div>
                  <button onClick={() => addToCart(product.id)} className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 font-semibold text-white transition hover:opacity-90">Add to cart</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 p-8 shadow-2xl shadow-cyan-950/20">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Why shoppers choose us</p>
            <h2 className="text-3xl font-semibold text-white">Built for gamers, creators and professionals</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-slate-300">
              <h3 className="text-xl font-semibold text-white">Fast shipping and secure checkout</h3>
              <p className="mt-3">Smooth order processing and local support with secure cart and checkout flow.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-slate-300">
              <h3 className="text-xl font-semibold text-white">Real-time inventory and admin tools</h3>
              <p className="mt-3">Admins can add, edit and remove products, categories and site text from a dedicated dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Social channels</p>
              <h2 className="text-3xl font-semibold text-white">Stay connected with Nova Computer Hub</h2>
            </div>
            <div className="flex gap-3">
              <a href="https://wa.me/94740620137" target="_blank" rel="noreferrer" className="rounded-full bg-green-600 px-4 py-2 font-semibold text-white">WhatsApp</a>
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 font-semibold text-white">Facebook</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
