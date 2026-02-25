"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircleIcon, MoreHorizontal, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { Permiso } from "../schema";

export const columns: ColumnDef<Permiso>[] = [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-left">
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "descripcion",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-left">
        Descripción
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "activo",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-left">
        Activo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("activo");
      return (
        <div>
          {isActive ? (
            <div className="flex gap-2"><CheckCircleIcon color="green" /> Activo</div>
          ) : (
            <div className="flex gap-2"><XCircleIcon color="red" /> Inactivo</div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <Link href={`/permisos/${row.original.id}/edit`}>
            <DropdownMenuItem>Editar</DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
