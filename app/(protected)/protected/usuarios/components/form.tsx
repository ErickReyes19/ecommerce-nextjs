"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createEcommerceUsuario, updateEcommerceUsuario } from "../actions";
import { EcommerceUsuarioInput } from "../schema";

export function EcommerceUsuarioForm({ initialData, roles }: { initialData: EcommerceUsuarioInput; roles: Array<{ id: string; name: string }> }) {
  const [form, setForm] = useState<EcommerceUsuarioInput>(initialData);
  const isUpdate = Boolean(initialData.id);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isUpdate) await updateEcommerceUsuario(form);
    else await createEcommerceUsuario(form);
    router.push("/protected/usuarios");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      <Input value={form.name ?? ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nombre" />
      <Input value={form.email ?? ""} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
      <select className="border rounded-md h-10 px-3 w-full" value={form.roleId ?? ""} onChange={(e) => setForm((p) => ({ ...p, roleId: e.target.value || null }))}>
        <option value="">Sin rol</option>
        {roles.map((r) => <option value={r.id} key={r.id}>{r.name}</option>)}
      </select>
      <Button type="submit">{isUpdate ? "Actualizar" : "Crear"}</Button>
    </form>
  );
}
