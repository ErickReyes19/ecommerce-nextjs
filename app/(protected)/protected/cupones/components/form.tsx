"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCupon, updateCupon } from "../actions";
import { CuponInput } from "../schema";

export function CuponForm({ initialData }: { initialData: CuponInput }) {
  const [form, setForm] = useState<CuponInput>(initialData);
  const router = useRouter();
  const isUpdate = Boolean(initialData.id);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isUpdate) await updateCupon(form);
    else await createCupon(form);
    router.push("/protected/cupones");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      <Input value={form.code ?? ""} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="Código" />
      <select className="border rounded-md h-10 px-3 w-full" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as CuponInput["type"] }))}>
        <option value="PERCENTAGE">Porcentaje</option>
        <option value="FIXED">Monto fijo</option>
      </select>
      <select className="border rounded-md h-10 px-3 w-full" value={form.target} onChange={(e) => setForm((p) => ({ ...p, target: e.target.value as CuponInput["target"] }))}>
        <option value="GLOBAL">Global</option>
        <option value="PRODUCT">Producto</option>
        <option value="CATEGORY">Categoría</option>
      </select>
      <Input type="number" step="0.01" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value) }))} placeholder="Valor" />
      <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />Activo</label>
      <Button type="submit">{isUpdate ? "Actualizar" : "Crear"}</Button>
    </form>
  );
}
