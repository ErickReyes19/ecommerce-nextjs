"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createMetodoEnvio, updateMetodoEnvio } from "../actions";
import { MetodoEnvioInput, metodoEnvioSchema } from "../schema";

export function MetodoEnvioForm({ initialData, zones }: { initialData: MetodoEnvioInput; zones: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const isUpdate = Boolean(initialData.id);
  const form = useForm<z.infer<typeof metodoEnvioSchema>>({ resolver: zodResolver(metodoEnvioSchema), defaultValues: initialData });

  async function onSubmit(data: z.infer<typeof metodoEnvioSchema>) {
    try {
      if (isUpdate) await updateMetodoEnvio(data);
      else await createMetodoEnvio(data);
      toast.success(isUpdate ? "Método actualizado" : "Método creado");
      router.push("/metodos-envio");
      router.refresh();
    } catch {
      toast.error("No se pudo guardar el método de envío");
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-md border p-4">
    <Controller name="zoneId" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Zona</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Selecciona zona" /></SelectTrigger><SelectContent>{zones.map((zone) => <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>)}</SelectContent></Select></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="name" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Nombre</FieldLabel><FieldContent><Input placeholder="Envío estándar" {...field} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <div className="grid gap-4 md:grid-cols-2">
      <Controller name="type" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Tipo</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="FLAT">Tarifa fija</SelectItem><SelectItem value="WEIGHT">Por peso</SelectItem><SelectItem value="PRICE">Por subtotal</SelectItem></SelectContent></Select></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
      <Controller name="price" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Precio</FieldLabel><FieldContent><Input type="number" min={0} step="0.01" {...field} /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    </div>
    <Controller name="active" control={form.control} render={({ field }) => <Field orientation="horizontal" className="justify-between rounded-md border p-3"><FieldLabel>Activo</FieldLabel><FieldContent><Switch checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} /></FieldContent></Field>} />
    <div className="flex justify-end"><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? "Actualizar" : "Crear"}</Button></div>
  </form>;
}
