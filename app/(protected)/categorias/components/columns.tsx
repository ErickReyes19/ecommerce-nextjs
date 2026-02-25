"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { deleteCategoria } from "../actions";
import { CategoriaInput } from "../schema";

export const columns: ColumnDef<CategoriaInput & { parentName?: string }>[] = [
  { accessorKey: "name", header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nombre<ArrowUpDown className="ml-2 h-4 w-4" /></Button> },
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "parentName", header: "Categoría padre" },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <Link href={`/categorias/${row.original.id}/edit`}><DropdownMenuItem>Editar</DropdownMenuItem></Link>
          <form action={deleteCategoria.bind(null, row.original.id || "")}><button type="submit" className="w-full text-left"><DropdownMenuItem>Eliminar</DropdownMenuItem></button></form>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
