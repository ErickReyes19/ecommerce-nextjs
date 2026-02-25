"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircleIcon, MoreHorizontal, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { deleteCupon } from "../actions";
import { CuponInput } from "../schema";

export const columns: ColumnDef<CuponInput>[] = [
  { accessorKey: "code", header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Código<ArrowUpDown className="ml-2 h-4 w-4" /></Button> },
  { accessorKey: "type", header: "Tipo" },
  { accessorKey: "target", header: "Objetivo" },
  { accessorKey: "value", header: "Valor" },
  { accessorKey: "active", header: "Activo", cell: ({ row }) => row.getValue("active") ? <div className="flex gap-2"><CheckCircleIcon color="green"/>Activo</div> : <div className="flex gap-2"><XCircleIcon color="red"/>Inactivo</div> },
  { id: "actions", header: "Acciones", cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Acciones</DropdownMenuLabel><Link href={`/cupones/${row.original.id}/edit`}><DropdownMenuItem>Editar</DropdownMenuItem></Link><form action={deleteCupon.bind(null, row.original.id || "")}><button type="submit" className="w-full text-left"><DropdownMenuItem>Eliminar</DropdownMenuItem></button></form></DropdownMenuContent></DropdownMenu> },
];
