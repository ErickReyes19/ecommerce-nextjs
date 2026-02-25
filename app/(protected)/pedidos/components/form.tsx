"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPedido, updatePedido } from "../actions";
import { PedidoInput, pedidoSchema } from "../schema";

export function PedidoForm({ initialData }: { initialData: PedidoInput }) {
  const router = useRouter();
  const isUpdate = Boolean(initialData.id);
  const form = useForm<z.infer<typeof pedidoSchema>>({ resolver: zodResolver(pedidoSchema), defaultValues: initialData });

  async function onSubmit(data: z.infer<typeof pedidoSchema>) {
    try {
      if (isUpdate) await updatePedido(data);
      else await createPedido(data);
      toast.success(isUpdate ? "Pedido actualizado" : "Pedido creado");
      router.push("/pedidos");
      router.refresh();
    } catch {
      toast.error("Hubo un error al guardar el pedido");
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 border rounded-md p-4">
    <Controller name="orderNumber" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Número de orden</FieldLabel><FieldContent><Input placeholder="ORD-2024-001" {...field} /></FieldContent><FieldDescription>Identificador del pedido.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="status" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Estado</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PENDIENTE">PENDIENTE</SelectItem><SelectItem value="PAGADO">PAGADO</SelectItem><SelectItem value="PROCESANDO">PROCESANDO</SelectItem><SelectItem value="ENVIADO">ENVIADO</SelectItem><SelectItem value="CANCELADO">FINALIZADO</SelectItem></SelectContent></Select></FieldContent><FieldDescription>Estado actual del pedido.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="subtotal" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Subtotal</FieldLabel><FieldContent><Input type="number" step="0.01" {...field} /></FieldContent><FieldDescription>Subtotal sin descuentos.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="grandTotal" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Total</FieldLabel><FieldContent><Input type="number" step="0.01" {...field} /></FieldContent><FieldDescription>Total final del pedido.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="notes" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Notas</FieldLabel><FieldContent><Input placeholder="Notas internas" {...field} value={field.value ?? ""} /></FieldContent><FieldDescription>Comentarios opcionales del pedido.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <div className="flex justify-end"><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando...</> : isUpdate ? "Actualizar" : "Crear"}</Button></div>
  </form>;
}
