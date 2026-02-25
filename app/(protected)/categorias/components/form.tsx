"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { createCategoria, updateCategoria } from "../actions";
import { CategoriaInput, categoriaSchema } from "../schema";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CategoriaForm({ initialData, categorias }: { initialData: CategoriaInput; categorias: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const isUpdate = Boolean(initialData.id);
  const form = useForm<z.infer<typeof categoriaSchema>>({ resolver: zodResolver(categoriaSchema), defaultValues: initialData });

  async function onSubmit(data: z.infer<typeof categoriaSchema>) {
    try {
      if (isUpdate) await updateCategoria(data);
      else await createCategoria(data);
      toast.success(isUpdate ? "Categoría actualizada" : "Categoría creada");
      router.push("/categorias");
      router.refresh();
    } catch {
      toast.error("Hubo un error al guardar la categoría");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 border rounded-md p-4">
      <Controller name="name" control={form.control} render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}><FieldLabel>Nombre</FieldLabel><FieldContent><Input placeholder="Nombre" {...field} /></FieldContent><FieldDescription>Nombre de la categoría.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
      )} />
      <Controller name="slug" control={form.control} render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}><FieldLabel>Slug</FieldLabel><FieldContent><Input placeholder="slug-categoria" {...field} /></FieldContent><FieldDescription>Identificador único de URL.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
      )} />
      <Controller name="description" control={form.control} render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}><FieldLabel>Descripción</FieldLabel><FieldContent><Input placeholder="Descripción" {...field} value={field.value ?? ""} /></FieldContent><FieldDescription>Descripción opcional.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
      )} />
      <Controller name="parentId" control={form.control} render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}><FieldLabel>Categoría padre</FieldLabel><FieldContent><Select value={field.value ?? "none"} onValueChange={(value) => field.onChange(value === "none" ? null : value)}><SelectTrigger><SelectValue placeholder="Sin categoría padre" /></SelectTrigger><SelectContent><SelectItem value="none">Sin categoría padre</SelectItem>{categorias.filter((categoria) => categoria.id !== initialData.id).map((categoria) => <SelectItem key={categoria.id} value={categoria.id}>{categoria.name}</SelectItem>)}</SelectContent></Select></FieldContent><FieldDescription>Relaciona una categoría padre.</FieldDescription>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>
      )} />
      <div className="flex justify-end"><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando...</> : isUpdate ? "Actualizar" : "Crear"}</Button></div>
    </form>
  );
}
