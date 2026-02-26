"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deleteProveedor } from "../actions";
import { ProveedorTableItem } from "./columns";

export default function ProveedoresListMobile({ proveedores }: { proveedores: ProveedorTableItem[] }) {
  return (
    <div className="space-y-3">
      <Link href="/proveedores/create"><Button className="w-full">Nuevo proveedor</Button></Link>
      {proveedores.map((proveedor) => (
        <div key={proveedor.id} className="rounded-md border p-3 space-y-2">
          <p className="font-medium">{proveedor.name}</p>
          <p className="text-sm text-muted-foreground">{proveedor.slug} · {proveedor.type}</p>
          <p className="text-sm">Servicios: {proveedor.servicesCount}</p>
          <div className="flex gap-2">
            <Link href={`/proveedores/${proveedor.id}/edit`} className="flex-1"><Button variant="outline" className="w-full">Editar</Button></Link>
            <form action={deleteProveedor.bind(null, proveedor.id)} className="flex-1"><Button variant="destructive" className="w-full" type="submit">Eliminar</Button></form>
          </div>
        </div>
      ))}
    </div>
  );
}
