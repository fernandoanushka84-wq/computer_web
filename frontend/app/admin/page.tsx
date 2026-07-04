"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, getToken, setToken } from "../../lib/api";

interface Product {
  id?: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  category_id: number;
  is_featured: boolean;
  is_active: boolean;
}

interface Category {
  id?: number;
  name: string;
  description: string;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [productForm, setProductForm] = useState<Product>({ name: "", slug: "", description: "", price: 0, stock_quantity: 0, image_url: "", category_id: 1, is_featured: false, is_active: true });
  const [categoryForm, setCategoryForm] = useState<Category>({ name: "", description: "" });
  const [token, setTokenState] = useState<string | null>(null);
  const [auth, setAuth] = useState({ email: "admin@computerhub.com", password: "Admin@1234" });
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);

  const loadProducts = async () => {
    const response = await fetch(`${API_BASE_URL}/products`);
    const data = await response.json();
    setProducts(data);
  };

  const loadCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const data = await response.json();
    setCategories(data);
  };

  const loadSettings = async () => {
    if (!token) return;
    const response = await fetch(`${API_BASE_URL}/admin/settings`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    setSettings(data);
  };

  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) setTokenState(savedToken);
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    if (token) {
      loadSettings();
    }
  }, [token]);

  const login = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(auth),
    });
    const data = await response.json();
    setToken(data.access_token);
    setTokenState(data.access_token);
    loadProducts();
    loadCategories();
    loadSettings();
  };

  const saveProduct = async () => {
    if (!token) return;
    const url = editingProductId ? `${API_BASE_URL}/admin/products/${editingProductId}` : `${API_BASE_URL}/admin/products`;
    const method = editingProductId ? "PUT" : "POST";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(productForm),
    });
    if (response.ok) {
      resetProductForm();
      loadProducts();
    }
  };

  const deleteProduct = async (id: number) => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/admin/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    loadProducts();
  };

  const editProduct = (product: Product) => {
    setEditingProductId(product.id || null);
    setProductForm({ ...product, description: product.description || "", image_url: product.image_url || "", category_id: product.category_id || 1 });
  };

  const resetProductForm = () => {
    setProductForm({ name: "", slug: "", description: "", price: 0, stock_quantity: 0, image_url: "", category_id: 1, is_featured: false, is_active: true });
    setEditingProductId(null);
  };

  const saveCategory = async () => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/admin/categories`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(categoryForm) });
    setCategoryForm({ name: "", description: "" });
    loadCategories();
  };

  const saveSettings = async () => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/admin/settings`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(settings) });
  };

  const uploadExcel = async () => {
    if (!token || !importFile) return;
    const formData = new FormData();
    formData.append("file", importFile);
    await fetch(`${API_BASE_URL}/admin/products/import`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
    setImportFile(null);
    loadProducts();
    loadCategories();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white">Admin dashboard</h1>
      <p className="mt-3 text-slate-300">Manage products, categories and storefront text from one private control panel.</p>
      {!token ? (
        <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <input className="mb-3 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
          <input className="mb-3 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" type="password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} />
          <button onClick={login} className="rounded-full bg-cyan-500 px-6 py-3 font-semibold text-slate-950">Sign in as admin</button>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-semibold text-white">Product manager</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Slug" value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" type="number" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} />
              <input className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" type="number" placeholder="Stock" value={productForm.stock_quantity} onChange={(e) => setProductForm({ ...productForm, stock_quantity: Number(e.target.value) })} />
              <input className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Image URL" value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} />
            </div>
            <div className="mt-3 flex gap-3">
              <button onClick={saveProduct} className="rounded-full bg-cyan-500 px-6 py-3 font-semibold text-slate-950">{editingProductId ? "Update product" : "Add product"}</button>
              <button onClick={resetProductForm} className="rounded-full border border-white/10 px-6 py-3 font-semibold text-white">Reset</button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-semibold text-white">Excel bulk import</h2>
            <p className="mt-2 text-sm text-slate-400">Upload an Excel sheet with columns: name, slug, description, price, stock_quantity, image_url, category_name, is_featured, is_active.</p>
            <input type="file" accept=".xlsx,.xls,.csv" className="mt-4 block w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
            <button onClick={uploadExcel} className="mt-4 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-slate-950">Import products</button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-semibold text-white">Category manager</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
            </div>
            <button onClick={saveCategory} className="mt-4 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-slate-950">Save category</button>
            <div className="mt-4 space-y-2">
              {categories.map((category) => <div key={category.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-slate-300">{category.name}</div>)}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-semibold text-white">Site settings</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Shop name" value={settings.shop_name || ""} onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="WhatsApp number" value={settings.whatsapp_number || ""} onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Hero title" value={settings.hero_title || ""} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Hero subtitle" value={settings.hero_subtitle || ""} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} />
              <input className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white" placeholder="Footer text" value={settings.footer_text || ""} onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })} />
            </div>
            <button onClick={saveSettings} className="mt-4 rounded-full bg-cyan-500 px-6 py-3 font-semibold text-slate-950">Save settings</button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-semibold text-white">Current catalogue</h2>
            <div className="mt-4 space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-300">
                  <div>
                    <p className="font-semibold text-white">{product.name}</p>
                    <p className="text-sm">Stock: {product.stock_quantity}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editProduct(product)} className="rounded-full border border-cyan-400/40 px-4 py-2 text-cyan-300">Edit</button>
                    <button onClick={() => deleteProduct(product.id!)} className="rounded-full border border-rose-400/40 px-4 py-2 text-rose-300">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
