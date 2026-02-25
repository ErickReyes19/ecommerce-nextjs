"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createPermiso, updatePermiso } from "../actions";
import { PermisoSchema } from "../schema";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FormularioPermiso({
  isUpdate,
  initialData,
}: {
  isUpdate: boolean;
  initialData?: z.infer<typeof PermisoSchema>;
}) {
  const router = useRouter();

  const form = useForm<z.input<typeof PermisoSchema>>({
    resolver: zodResolver(PermisoSchema),
    defaultValues: initialData || {
      nombre: "",
      descripcion: "",
      activo: true,
    },
  });

  async function onSubmit(values: z.input<typeof PermisoSchema>) {
    const data = PermisoSchema.parse(values);
    const result = isUpdate ? await updatePermiso(data) : await createPermiso(data);

    if (!result) {
      toast.error("No se pudo guardar el permiso");
      return;
    }

    toast.success(isUpdate ? "Permiso actualizado" : "Permiso creado");
    router.push("/permisos");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 border rounded-md p-4">
      <Controller
        name="nombre"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Nombre</FieldLabel>
            <FieldContent>
              <Input placeholder="Ingresa el nombre del permiso" {...field} />
            </FieldContent>
            <FieldDescription>Nombre interno del permiso.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="descripcion"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Descripción</FieldLabel>
            <FieldContent>
              <Input placeholder="Describe el permiso" {...field} />
            </FieldContent>
            <FieldDescription>Descripción visible para usuarios administradores.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {isUpdate && (
        <Controller
          name="activo"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Estado</FieldLabel>
              <FieldContent>
                <Select value={field.value ? "true" : "false"} onValueChange={(value) => field.onChange(value === "true")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
          ) : isUpdate ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
