"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createProduct, updateProduct } from "../actions";
import { ProductInput } from "../schema";

export function ProductoForm({ initialData, categorias }: { initialData: ProductInput; categorias: Array<{ id: string; name: string }> }) {
  const [form, setForm] = useState<ProductInput>(initialData);
  const isUpdate = Boolean(initialData.id);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isUpdate) await updateProduct(form);
    else await createProduct(form);
    router.push("/protected/productos");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      <Input value={form.name ?? ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nombre" />
      <Input value={form.slug ?? ""} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug" />
      <Input value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Descripción" />
      <Input value={form.sku ?? ""} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} placeholder="SKU" />
      <Input type="number" step="0.01" value={form.basePrice} onChange={(e) => setForm((p) => ({ ...p, basePrice: Number(e.target.value) }))} placeholder="Precio base" />
      <select className="border rounded-md h-10 px-3 w-full" value={form.categoryId ?? ""} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}>
        <option value="">Selecciona categoría</option>
        {categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <Button type="submit">{isUpdate ? "Actualizar" : "Crear"}</Button>
    </form>
  );
}
