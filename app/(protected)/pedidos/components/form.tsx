"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPedido, updatePedido } from "../actions";
import { PedidoInput } from "../schema";

export function PedidoForm({ initialData }: { initialData: PedidoInput }) {
  const [form, setForm] = useState<PedidoInput>(initialData);
  const router = useRouter();
  const isUpdate = Boolean(initialData.id);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isUpdate) await updatePedido(form);
    else await createPedido(form);
    router.push("/pedidos");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      <Input value={form.orderNumber ?? ""} onChange={(e) => setForm((p) => ({ ...p, orderNumber: e.target.value }))} placeholder="Número de orden" />
      <select className="border rounded-md h-10 px-3 w-full" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as PedidoInput["status"] }))}>
        <option value="PENDIENTE">PENDIENTE</option>
        <option value="PAGADO">PAGADO</option>
        <option value="PROCESANDO">PROCESANDO</option>
        <option value="ENVIADO">ENVIADO</option>
        <option value="CANCELADO">CANCELADO</option>
      </select>
      <Input type="number" step="0.01" value={form.subtotal} onChange={(e) => setForm((p) => ({ ...p, subtotal: Number(e.target.value) }))} placeholder="Subtotal" />
      <Input type="number" step="0.01" value={form.grandTotal} onChange={(e) => setForm((p) => ({ ...p, grandTotal: Number(e.target.value) }))} placeholder="Total" />
      <Input value={form.notes ?? ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notas" />
      <Button type="submit">{isUpdate ? "Actualizar" : "Crear"}</Button>
    </form>
  );
}
