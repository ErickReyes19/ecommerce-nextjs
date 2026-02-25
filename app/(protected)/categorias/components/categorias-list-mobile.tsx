"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CategoriaInput } from "../schema";

export default function CategoriasListMobile({ categorias }: { categorias: Array<CategoriaInput & { parentName?: string }> }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = categorias.filter((categoria) =>
    categoria.name.toLowerCase().includes(searchTerm.toLowerCase()) || categoria.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <Link href="/categorias/create"><Button className="w-full flex items-center gap-2">Nueva categoría<Plus /></Button></Link>
      <div className="relative">
        <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar categoría..." className="pl-10" />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      {filtered.map((categoria) => (
        <div key={categoria.id} className="flex items-center justify-between p-4 rounded-lg shadow border">
          <div>
            <h3 className="text-sm font-medium truncate">{categoria.name}</h3>
            <p className="text-xs mt-1 truncate">Slug: {categoria.slug}</p>
          </div>
          <Link href={`/categorias/${categoria.id}/edit`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link>
        </div>
      ))}
    </div>
  );
}
