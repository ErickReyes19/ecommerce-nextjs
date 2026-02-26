"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductInput } from "../schema";

export default function ProductosListMobile({ productos }: { productos: Array<ProductInput & { categoryName?: string; providerName?: string }> }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = productos.filter((producto) => producto.name.toLowerCase().includes(searchTerm.toLowerCase()) || producto.sku.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="space-y-4"><Link href="/productos-admin/create"><Button className="w-full flex items-center gap-2">Nuevo producto<Plus /></Button></Link><div className="relative"><Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar producto..." className="pl-10" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /></div>{filtered.map((producto) => <div key={producto.id} className="flex items-center justify-between p-4 rounded-lg shadow border"><div><h3 className="text-sm font-medium truncate">{producto.name}</h3><p className="text-xs mt-1 truncate">{producto.sku} · {producto.categoryName} · {producto.providerName ?? "Interno"}</p></div><Link href={`/productos-admin/${producto.id}/edit`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link></div>)}</div>;
}
