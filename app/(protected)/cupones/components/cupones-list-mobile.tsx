"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CuponInput } from "../schema";

export default function CuponesListMobile({ cupones }: { cupones: CuponInput[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = cupones.filter((cupon) => cupon.code.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="space-y-4"><Link href="/cupones/create"><Button className="w-full flex items-center gap-2">Nuevo cupón<Plus /></Button></Link><div className="relative"><Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar cupón..." className="pl-10" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /></div>{filtered.map((cupon) => <div key={cupon.id} className="flex items-center justify-between p-4 rounded-lg shadow border"><div><h3 className="text-sm font-medium truncate">{cupon.code}</h3><p className="text-xs mt-1 truncate">{cupon.type} · {cupon.target}</p></div><Link href={`/cupones/${cupon.id}/edit`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link></div>)}</div>;
}
