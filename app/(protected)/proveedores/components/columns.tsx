"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteProveedor, desactivarProductosProveedor, syncProveedorProductos } from "../actions";

export type ProveedorTableItem = {
  id: string;
  name: string;
  slug: string;
  type: "API" | "MANUAL";
  active: boolean;
  servicesCount: number;
};

function SyncProveedorDropdownAction({ proveedorId }: { proveedorId: string }) {
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
    <DropdownMenuItem asChild>
      <button type="button" onClick={handleSync} disabled={isPending} className="w-full text-left">
        {isPending ? "Sincronizando..." : "Sincronizar productos"}
      </button>
    </DropdownMenuItem>
  );
}


function DeactivateProveedorDropdownAction({ proveedorId }: { proveedorId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDeactivate = () => {
    startTransition(() => {
      void (async () => {
        const result = await desactivarProductosProveedor(proveedorId);

        if (!result.ok) {
          toast.error(result.error ?? "No se pudieron desactivar los productos del proveedor.");
          return;
        }

        toast.success(`Productos desactivados: ${result.updated}.`);
      })();
    });
  };

  return (
    <DropdownMenuItem asChild>
      <button type="button" onClick={handleDeactivate} disabled={isPending} className="w-full text-left">
        {isPending ? "Desactivando..." : "Desactivar productos"}
      </button>
    </DropdownMenuItem>
  );
}

export const columns: ColumnDef<ProveedorTableItem>[] = [
  { accessorKey: "name", header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nombre<ArrowUpDown className="ml-2 h-4 w-4" /></Button> },
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "type", header: "Tipo" },
  { accessorKey: "servicesCount", header: "Servicios" },
  { accessorKey: "active", header: "Estado", cell: ({ row }) => row.original.active ? "Activo" : "Inactivo" },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <SyncProveedorDropdownAction proveedorId={row.original.id} />
        <DeactivateProveedorDropdownAction proveedorId={row.original.id} />
        <Link href={`/proveedores/${row.original.id}/edit`}><DropdownMenuItem>Editar</DropdownMenuItem></Link>
        <form action={deleteProveedor.bind(null, row.original.id)}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full text-left">Eliminar</button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>,
  },
];
