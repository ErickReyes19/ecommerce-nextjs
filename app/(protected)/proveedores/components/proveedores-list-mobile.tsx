"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteProveedor, syncProveedorProductos } from "../actions";
import { ProveedorTableItem } from "./columns";

function SyncProveedorButton({ proveedorId }: { proveedorId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleSync = () => {
    startTransition(() => {
      void (async () => {
        const result = await syncProveedorProductos(proveedorId);

        if (!result.ok) {
          toast.error(result.error ?? "No se pudo sincronizar el proveedor.");
          return;
        }

        if (result.errors.length > 0) {
          toast.warning(`Sincronización parcial: ${result.synced} productos actualizados. ${result.errors.join(" · ")}`);
          return;
        }

        toast.success(`Sincronización completada: ${result.synced} productos actualizados.`);
      })();
    });
  };

  return (
    <Button variant="secondary" className="w-full" type="button" onClick={handleSync} disabled={isPending}>
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isPending ? "Sincronizando..." : "Sincronizar productos"}
    </Button>
  );
}

export default function ProveedoresListMobile({ proveedores }: { proveedores: ProveedorTableItem[] }) {
  return (
    <div className="space-y-3">
      <Link href="/proveedores/create"><Button className="w-full">Nuevo proveedor</Button></Link>
      {proveedores.map((proveedor) => (
        <div key={proveedor.id} className="rounded-md border p-3 space-y-2">
          <p className="font-medium">{proveedor.name}</p>
          <p className="text-sm text-muted-foreground">{proveedor.slug} · {proveedor.type}</p>
          <p className="text-sm">Servicios: {proveedor.servicesCount}</p>
          <div className="grid grid-cols-1 gap-2">
            <SyncProveedorButton proveedorId={proveedor.id} />
            <div className="flex gap-2">
              <Link href={`/proveedores/${proveedor.id}/edit`} className="flex-1"><Button variant="outline" className="w-full">Editar</Button></Link>
              <form action={deleteProveedor.bind(null, proveedor.id)} className="flex-1"><Button variant="destructive" className="w-full" type="submit">Eliminar</Button></form>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
