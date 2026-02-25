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
import { createCupon, updateCupon } from "../actions";
import { CuponInput, cuponSchema } from "../schema";

export function CuponForm({ initialData }: { initialData: CuponInput }) {
  const router = useRouter();
  const isUpdate = Boolean(initialData.id);
  const form = useForm<z.infer<typeof cuponSchema>>({ resolver: zodResolver(cuponSchema), defaultValues: initialData });

  async function onSubmit(data: z.infer<typeof cuponSchema>) {
    try {
      if (isUpdate) await updateCupon(data);
      else await createCupon(data);
      toast.success(isUpdate ? "Cupón actualizado" : "Cupón creado");
      router.push("/cupones");
      router.refresh();
    } catch {
      toast.error("Hubo un error al guardar el cupón");
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 border rounded-md p-4">
    <Controller name="code" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Código</FieldLabel><FieldContent><Input placeholder="CODIGO10" {...field} /></FieldContent><FieldDescription>Código del cupón.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="type" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Tipo</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PERCENTAGE">Porcentaje</SelectItem><SelectItem value="FIXED">Monto fijo</SelectItem></SelectContent></Select></FieldContent><FieldDescription>Tipo de descuento.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="target" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Aplica a</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="GLOBAL">Global</SelectItem><SelectItem value="PRODUCT">Producto</SelectItem><SelectItem value="CATEGORY">Categoría</SelectItem></SelectContent></Select></FieldContent><FieldDescription>Define el alcance.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="value" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Valor</FieldLabel><FieldContent><Input type="number" step="0.01" {...field} /></FieldContent><FieldDescription>Valor del descuento.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <Controller name="active" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Estado</FieldLabel><FieldContent><Select value={field.value ? "true" : "false"} onValueChange={(value) => field.onChange(value === "true")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">Activo</SelectItem><SelectItem value="false">Inactivo</SelectItem></SelectContent></Select></FieldContent><FieldDescription>Estado del cupón.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
    <div className="flex justify-end"><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando...</> : isUpdate ? "Actualizar" : "Crear"}</Button></div>
  </form>;
}
