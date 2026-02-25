"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { deletePedido } from "../actions";
import { PedidoInput } from "../schema";
import { getOrderStatusLabel } from "@/src/lib/order-status";

export const columns: ColumnDef<PedidoInput>[] = [
  { accessorKey: "orderNumber", header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Número<ArrowUpDown className="ml-2 h-4 w-4" /></Button> },
  { accessorKey: "status", header: "Estado", cell: ({ row }) => getOrderStatusLabel(row.original.status) },
  { accessorKey: "subtotal", header: "Subtotal" },
  { accessorKey: "grandTotal", header: "Total" },
  { id: "actions", header: "Acciones", cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Acciones</DropdownMenuLabel><Link href={`/pedidos/${row.original.id}/edit`}><DropdownMenuItem>Editar</DropdownMenuItem></Link><form action={deletePedido.bind(null, row.original.id || "")}><button type="submit" className="w-full text-left"><DropdownMenuItem>Eliminar</DropdownMenuItem></button></form></DropdownMenuContent></DropdownMenu> },
];
