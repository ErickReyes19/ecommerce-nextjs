"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createProveedor, inspectProveedorServiceProducts, updateProveedor } from "../actions";
import { ProveedorInput, proveedorSchema } from "../schema";

const mappingTargets = ["externalProductId", "name", "sku", "price", "stock", "description", "image", "slug", "rating"] as const;
type MappingTarget = typeof mappingTargets[number];

function parseMapping(value: string | null | undefined): Partial<Record<MappingTarget, string>> {
  if (!value?.trim()) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const result: Partial<Record<MappingTarget, string>> = {};
    for (const target of mappingTargets) {
      if (typeof parsed[target] === "string") result[target] = parsed[target] as string;
    }
    return result;
  } catch {
    return {};
  }
}

export function ProveedorForm({ initialData }: { initialData: ProveedorInput }) {
  const router = useRouter();
  const isUpdate = Boolean(initialData.id);
  const [loadingInspectIndex, setLoadingInspectIndex] = useState<number | null>(null);
  const [serviceFields, setServiceFields] = useState<Record<number, string[]>>({});
  const [serviceSamples, setServiceSamples] = useState<Record<number, string>>({});
  const form = useForm<ProveedorInput>({ resolver: zodResolver(proveedorSchema), defaultValues: initialData });
  const services = useFieldArray({ control: form.control, name: "services" });

  async function inspectService(index: number) {
    const current = form.getValues(`services.${index}`);
    if (!current?.baseUrl || !current?.productEndpoint) {
      toast.error("Completa URL base y endpoint de productos antes de inspeccionar.");
      return;
    }

    setLoadingInspectIndex(index);
    const result = await inspectProveedorServiceProducts({
      baseUrl: current.baseUrl,
      productEndpoint: current.productEndpoint,
      authType: current.authType,
      token: current.token,
      apiKey: current.apiKey,
      headersJson: current.headersJson,
    });
    setLoadingInspectIndex(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setServiceFields((prev) => ({ ...prev, [index]: result.fields.map((field) => field.path) }));
    setServiceSamples((prev) => ({ ...prev, [index]: result.sample }));
    toast.success(`Se detectaron ${result.fields.length} propiedades en ${result.totalItems} productos.`);
  }

  function updateMappingField(index: number, target: MappingTarget, value: string) {
    const currentRaw = form.getValues(`services.${index}.productMappingJson`);
    const current = parseMapping(currentRaw);
    if (value) current[target] = value;
    else delete current[target];
    form.setValue(`services.${index}.productMappingJson`, JSON.stringify(current, null, 2), { shouldDirty: true });
  }

  async function onSubmit(data: ProveedorInput) {
    try {
      if (isUpdate) await updateProveedor(data);
      else await createProveedor(data);
      toast.success(isUpdate ? "Proveedor actualizado" : "Proveedor creado");
      router.push("/proveedores");
      router.refresh();
    } catch {
      toast.error("No se pudo guardar el proveedor");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rounded-md border p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Controller name="name" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Nombre</FieldLabel><FieldContent><Input {...field} placeholder="Proveedor X" /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
        <Controller name="slug" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Slug</FieldLabel><FieldContent><Input {...field} placeholder="proveedor-x" /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
      </div>
      <Controller name="description" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Descripción</FieldLabel><FieldContent><Input {...field} value={field.value ?? ""} placeholder="Descripción opcional" /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
      <div className="grid gap-4 md:grid-cols-2">
        <Controller name="type" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Tipo</FieldLabel><FieldContent><Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="API">API</SelectItem><SelectItem value="MANUAL">Manual</SelectItem></SelectContent></Select></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
        <Controller name="active" control={form.control} render={({ field }) => <Field orientation="horizontal" className="justify-between rounded-md border p-3"><FieldLabel>Activo</FieldLabel><FieldContent><Switch checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} /></FieldContent></Field>} />
      </div>

      <div className="space-y-4 rounded-md border p-4">
        <div className="flex items-center justify-between"><h3 className="font-semibold">Servicios</h3><Button type="button" variant="outline" onClick={() => services.append({ name: "", baseUrl: "", productEndpoint: "/products", orderEndpoint: "/orders", authType: "BEARER", token: "", apiKey: "", secretKey: "", headersJson: "", productMappingJson: "", active: true })}><Plus className="mr-2 h-4 w-4" />Agregar servicio</Button></div>
        {services.fields.map((service, index) => {
          const detected = serviceFields[index] ?? [];
          const currentMapping = parseMapping(form.watch(`services.${index}.productMappingJson`));
          return (
            <div key={service.id} className="space-y-4 rounded-md border p-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Controller name={`services.${index}.name`} control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Nombre del servicio</FieldLabel><FieldContent><Input {...field} placeholder="Catálogo API" /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
                <Controller name={`services.${index}.baseUrl`} control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>URL base</FieldLabel><FieldContent><Input {...field} placeholder="https://api.tienda-x.com" /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
                <Controller name={`services.${index}.productEndpoint`} control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Endpoint productos</FieldLabel><FieldContent><Input {...field} placeholder="/v1/products" /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
                <Controller name={`services.${index}.orderEndpoint`} control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Endpoint órdenes</FieldLabel><FieldContent><Input {...field} placeholder="/v1/orders" /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
                <Controller name={`services.${index}.authType`} control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Autenticación</FieldLabel><FieldContent><Input {...field} placeholder="BEARER | API_KEY | NONE" /></FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</Field>} />
                <Controller name={`services.${index}.token`} control={form.control} render={({ field }) => <Field><FieldLabel>Token</FieldLabel><FieldContent><Input {...field} value={field.value ?? ""} /></FieldContent></Field>} />
                <Controller name={`services.${index}.apiKey`} control={form.control} render={({ field }) => <Field><FieldLabel>API Key</FieldLabel><FieldContent><Input {...field} value={field.value ?? ""} /></FieldContent></Field>} />
                <Controller name={`services.${index}.secretKey`} control={form.control} render={({ field }) => <Field><FieldLabel>Secret Key</FieldLabel><FieldContent><Input {...field} value={field.value ?? ""} /></FieldContent></Field>} />
              </div>

              <Controller name={`services.${index}.headersJson`} control={form.control} render={({ field }) => <Field><FieldLabel>Headers extra (JSON)</FieldLabel><FieldContent><Textarea {...field} value={field.value ?? ""} placeholder='{"x-store":"main"}' /></FieldContent></Field>} />

              <div className="rounded-md border p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">Mapeo dinámico de propiedades</p>
                  <Button type="button" variant="secondary" size="sm" onClick={() => inspectService(index)} disabled={loadingInspectIndex === index}>
                    {loadingInspectIndex === index ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}Traer propiedades
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Conecta al endpoint, detecta propiedades y define qué campo externo corresponde a cada propiedad interna.</p>

                <div className="grid gap-3 md:grid-cols-2">
                  {mappingTargets.map((target) => (
                    <Field key={target}>
                      <FieldLabel>{target} ← propiedad externa</FieldLabel>
                      <FieldContent>
                        <Select
                          value={currentMapping[target] ?? "__none__"}
                          onValueChange={(value) => updateMappingField(index, target, value === "__none__" ? "" : value)}
                        >
                          <SelectTrigger><SelectValue placeholder="Seleccionar propiedad" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Sin asignar</SelectItem>
                            {detected.map((path) => <SelectItem key={`${target}-${path}`} value={path}>{path}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                  ))}
                </div>

                {!!serviceSamples[index] && (
                  <details className="rounded border p-2">
                    <summary className="cursor-pointer text-xs">Ver ejemplo de producto detectado</summary>
                    <pre className="mt-2 max-h-56 overflow-auto text-xs">{serviceSamples[index]}</pre>
                  </details>
                )}
              </div>

              <Controller name={`services.${index}.productMappingJson`} control={form.control} render={({ field }) => <Field><FieldLabel>Mapeo de propiedades (JSON guardado)</FieldLabel><FieldContent><Textarea {...field} value={field.value ?? ""} placeholder='{"name":"title","description":"body","price":"pricing.amount","stock":"inventory.available","image":"media.main.url"}' /></FieldContent></Field>} />
              <div className="flex items-center justify-between">
                <Controller name={`services.${index}.active`} control={form.control} render={({ field }) => <Field orientation="horizontal" className="justify-between"><FieldLabel>Servicio activo</FieldLabel><FieldContent><Switch checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} /></FieldContent></Field>} />
                <Button type="button" variant="destructive" size="sm" onClick={() => services.remove(index)} disabled={services.fields.length <= 1}><Trash2 className="mr-2 h-4 w-4" />Eliminar</Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end"><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : isUpdate ? "Actualizar" : "Crear"}</Button></div>
    </form>
  );
}
