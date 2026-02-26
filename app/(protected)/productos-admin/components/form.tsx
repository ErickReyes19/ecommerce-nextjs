"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createProduct, updateProduct } from "../actions";
import { ProductInput, productSchema } from "../schema";

export function ProductoForm({
  initialData,
  categorias,
  marcas,
}: {
  initialData: ProductInput;
  categorias: Array<{ id: string; name: string }>;
  marcas: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const isUpdate = Boolean(initialData.id);
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData,
  });

  async function onSubmit(data: z.infer<typeof productSchema>) {
    try {
      if (isUpdate) await updateProduct(data);
      else await createProduct(data);
      toast.success(isUpdate ? "Producto actualizado" : "Producto creado");
      router.push("/productos-admin");
      router.refresh();
    } catch {
      toast.error("Hubo un error al guardar el producto");
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8 rounded-md border p-4"
    >
      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="text-base font-semibold">Información general</h3>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Nombre</FieldLabel>
              <FieldContent>
                <Input placeholder="Nombre del producto" {...field} />
              </FieldContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Slug</FieldLabel>
              <FieldContent>
                <Input placeholder="nombre-producto" {...field} />
              </FieldContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Descripción</FieldLabel>
              <FieldContent>
                <Input placeholder="Descripción del producto" {...field} />
              </FieldContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="shortDescription"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Descripción corta</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Resumen para cards"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(event) =>
                    field.onChange(event.target.value || null)
                  }
                />
              </FieldContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="sku"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>SKU</FieldLabel>
              <FieldContent>
                <Input placeholder="SKU-001" {...field} />
              </FieldContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="imageUrls"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Imágenes del producto</FieldLabel>
              <FieldDescription>
                Ingresa una URL por línea. La primera imagen será la principal.
              </FieldDescription>
              <FieldContent>
                <textarea
                  className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="https://sitio.com/imagen-1.jpg&#10;https://sitio.com/imagen-2.jpg"
                  value={field.value ?? ""}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </FieldContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="text-base font-semibold">Precios e inventario</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            name="basePrice"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Precio base</FieldLabel>
                <FieldContent>
                  <Input type="number" step="0.01" {...field} />
                </FieldContent>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="compareAtPrice"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Precio comparativo</FieldLabel>
                <FieldContent>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Opcional"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === "" ? null : event.target.value,
                      )
                    }
                  />
                </FieldContent>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="salePrice"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Precio descuento</FieldLabel>
                <FieldContent>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Opcional"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === "" ? null : event.target.value,
                      )
                    }
                  />
                </FieldContent>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            name="stock"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Stock</FieldLabel>
                <FieldContent>
                  <Input type="number" min={0} step={1} {...field} />
                </FieldContent>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="defaultVariantName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Nombre variante por defecto</FieldLabel>
                <FieldContent>
                  <Input placeholder="Variante Base" {...field} />
                </FieldContent>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="defaultVariantWeight"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Peso variante</FieldLabel>
                <FieldContent>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Opcional"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === "" ? null : event.target.value,
                      )
                    }
                  />
                </FieldContent>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="text-base font-semibold">Clasificación y visibilidad</h3>
        <Controller
          name="categoryId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Categoría</FieldLabel>
              <FieldContent>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="brandId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Marca</FieldLabel>
              <FieldContent>
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin marca</SelectItem>
                    {marcas.map((marca) => (
                      <SelectItem key={marca.id} value={marca.id}>
                        {marca.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="active"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              orientation="horizontal"
              className="justify-between rounded-lg border p-4"
            >
              <div>
                <FieldLabel>Producto activo</FieldLabel>
                <FieldDescription>
                  Visible para clientes en el catálogo.
                </FieldDescription>
              </div>
              <FieldContent>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(Boolean(checked))
                  }
                />
              </FieldContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </section>

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
