"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PedidoListItem } from "../actions";
import { formatHNL } from "@/src/lib/currency";
import { getOrderStatusLabel } from "@/src/lib/order-status";

export default function PedidosListMobile({ pedidos }: { pedidos: PedidoListItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = pedidos.filter((pedido) => pedido.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="space-y-4"><Link href="/pedidos/create"><Button className="w-full flex items-center gap-2">Nuevo pedido<Plus /></Button></Link><div className="relative"><Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar pedido..." className="pl-10" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /></div>{filtered.map((pedido) => <div key={pedido.id} className="flex items-center justify-between p-4 rounded-lg shadow border"><div><h3 className="text-sm font-medium truncate">{pedido.orderNumber}</h3><p className="text-xs mt-1 truncate">{pedido.userName}</p><p className="text-xs mt-1 truncate">{getOrderStatusLabel(pedido.status)} · {formatHNL(Number(pedido.grandTotal))}</p></div><div className="flex items-center gap-2"><Link href={`/pedidos/${pedido.id}`}><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></Link><Link href={`/pedidos/${pedido.id}/edit`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link></div></div>)}</div>;
}
