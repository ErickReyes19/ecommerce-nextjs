"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCategoria, updateCategoria } from "../actions";
import { CategoriaInput } from "../schema";

export function CategoriaForm({ initialData, categorias }: { initialData: CategoriaInput; categorias: Array<{ id: string; name: string }> }) {
  const [form, setForm] = useState<CategoriaInput>(initialData);
  const router = useRouter();
  const isUpdate = Boolean(initialData.id);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isUpdate) await updateCategoria(form);
    else await createCategoria(form);
    router.push("/protected/categorias");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      <Input value={form.name ?? ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nombre" />
      <Input value={form.slug ?? ""} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug" />
      <Input value={form.description ?? ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Descripción" />
      <select
        className="border rounded-md h-10 px-3 w-full"
        value={form.parentId ?? ""}
        onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value || null }))}
      >
        <option value="">Sin categoría padre</option>
        {categorias.filter((c) => c.id !== form.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <Button type="submit">{isUpdate ? "Actualizar" : "Crear"}</Button>
    </form>
  );
}
