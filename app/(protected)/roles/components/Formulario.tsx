"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

import { Permiso } from "../../permisos/schema";
import { PermisosRol } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { postRol, putRol } from "../actions";
import { RolSchema } from "../schema";
import { CheckboxPermisos } from "./checkboxForm";
import { toast } from "sonner";

export function FormularioRol({
  isUpdate,
  initialData,
  permisos,
}: {
  isUpdate: boolean;
  initialData?: z.infer<typeof RolSchema>;
  permisos: Permiso[];
}) {
  const router = useRouter();

  const form = useForm<z.infer<typeof RolSchema>>({
    resolver: zodResolver(RolSchema),
    defaultValues: initialData || { permisos: [] },
  });

  async function onSubmit(data: z.infer<typeof RolSchema>) {
    const rolData = {
      rol: data,
      permisosRol: data.permisos.map((permiso: PermisosRol) => permiso.id),
    };

    try {
      if (isUpdate) {
        await putRol(rolData);
      } else {
        await postRol(rolData);
      }

      toast.success(isUpdate ? "Rol actualizado" : "Rol creado");

      router.push("/roles");
      router.refresh();
    } catch (error) {
      console.error("Error en la operación:", error);
      toast.error("Hubo un problema al guardar el rol");
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8 border rounded-md p-4"
    >
      {/* Nombre */}
      <Controller
        name="nombre"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Nombre del Rol</FieldLabel>
            <FieldContent>
              <Input placeholder="Ingresa el nombre del rol" {...field} />
            </FieldContent>
            <FieldDescription>
              Por favor ingresa el nombre del rol.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Descripción */}
      <Controller
        name="descripcion"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Descripción</FieldLabel>
            <FieldContent>
              <Input placeholder="Ingresa la descripción" {...field} />
            </FieldContent>
            <FieldDescription>
              Proporciona una breve descripción del rol.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Permisos */}
      <Controller
        name="permisos"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Permisos del Rol</FieldLabel>
            <FieldContent>
              <CheckboxPermisos
                permisos={permisos}
                selectedPermisos={
                  field.value?.map((p: PermisosRol) => p.id) || []
                }
                onChange={(selectedIds) => {
                  const selectedPermisosRol = permisos.filter((permiso) =>
                    selectedIds.includes(permiso.id || "")
                  );
                  field.onChange(selectedPermisosRol);
                }}
              />
            </FieldContent>
            <FieldDescription>
              Selecciona los permisos asociados a este rol.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Estado (solo update) */}
      {isUpdate && (
        <Controller
          name="activo"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Estado</FieldLabel>
              <FieldContent>
                <Select
                  value={field.value ? "true" : "false"}
                  onValueChange={(value) =>
                    field.onChange(value === "true")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
              <FieldDescription>
                Define si el rol está activo o inactivo.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}

      {/* Botón */}
      <div className="flex justify-end">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </>
          ) : isUpdate ? (
            "Actualizar"
          ) : (
            "Crear"
          )}
        </Button>
      </div>
    </form>
  );
}
