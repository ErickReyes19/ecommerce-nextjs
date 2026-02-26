"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { deleteProveedor, syncProveedorProductos } from "../actions";

export type ProveedorTableItem = {
  id: string;
  name: string;
  slug: string;
  type: "API" | "MANUAL";
  active: boolean;
  servicesCount: number;
};

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
        <form action={syncProveedorProductos.bind(null, row.original.id)}><button type="submit" className="w-full text-left"><DropdownMenuItem>Sincronizar productos</DropdownMenuItem></button></form>
        <Link href={`/proveedores/${row.original.id}/edit`}><DropdownMenuItem>Editar</DropdownMenuItem></Link>
        <form action={deleteProveedor.bind(null, row.original.id)}><button type="submit" className="w-full text-left"><DropdownMenuItem>Eliminar</DropdownMenuItem></button></form>
      </DropdownMenuContent>
    </DropdownMenu>,
  },
];
