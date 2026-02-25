"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export function DataTable<TData, TValue>({ columns, data }: { columns: ColumnDef<TData, TValue>[]; data: TData[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), onSortingChange: setSorting, getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), state: { sorting, columnFilters, globalFilter }, globalFilterFn: (row) => Object.values(row.original as Record<string, unknown>).some((v) => String(v).toLowerCase().includes(globalFilter.toLowerCase())) });
  return <div className="rounded-md border p-4"><div className="flex flex-col md:flex-row items-center py-4 justify-between space-y-2 md:space-y-0 md:space-x-4"><Input placeholder="Filtrar productos" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="w-full md:max-w-sm" /><Link href="/productos-admin/create" className="w-full md:w-auto"><Button className="w-full md:w-auto flex items-center gap-2">Nuevo producto <Plus /></Button></Link></div><div className="rounded-md border"><Table><TableHeader>{table.getHeaderGroups().map((hg) => <TableRow key={hg.id}>{hg.headers.map((h) => <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>)}</TableHeader><TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length}>Sin resultados.</TableCell></TableRow>}</TableBody></Table></div><div className="flex items-center justify-end space-x-2 py-4"><Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button><Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button></div></div>;
}
