"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PenBox, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Permiso } from "../schema";

interface PermissionListProps {
  permisos: Permiso[];
}

export default function PermissionListMobile({ permisos }: PermissionListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPermisos = permisos.filter(
    (permiso) =>
      permiso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permiso.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4">
      <Link href="/permisos/create" className="w-full">
        <Button className="w-full">Nuevo permiso<Plus className="ml-2 h-4 w-4" /></Button>
      </Link>

      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar permiso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      <ScrollArea className="h-[500px]">
        {filteredPermisos.map((permiso) => (
          <div key={permiso.id} className="p-4 rounded-lg shadow border my-2 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center min-w-0">
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${permiso.activo ? "bg-green-500" : "bg-red-500"
                    }`}
                />
                <h3 className="text-sm font-medium truncate">{permiso.nombre}</h3>
              </div>
              <Link href={`/permisos/${permiso.id}/edit`}>
                <Button variant="outline" size="icon">
                  <PenBox className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-xs mt-1">{permiso.descripcion}</p>
          </div>
        ))}
        {filteredPermisos.length === 0 && (
          <p className="text-center text-gray-500">
            No se encontraron permisos.
          </p>
        )}
        {filteredPermisos.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Mostrando {filteredPermisos.length} de {permisos.length} permisos
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
