import Link from "next/link";
import { deleteProduct, getProductos } from "./actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminProductosPage() {
  const products = await getProductos();
  return (
    <main className="space-y-3">
      <Link href="/productos-admin/create" className="underline">Nuevo producto</Link>
      <Table><TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>SKU</TableHead><TableHead>Categoría</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader><TableBody>{products.map((p) => <TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell>{p.sku}</TableCell><TableCell>{p.category.name}</TableCell><TableCell><div className="flex gap-2"><Link href={`/productos-admin/${p.id}/edit`} className="underline">Editar</Link><form action={deleteProduct.bind(null, p.id)}><button className="underline" type="submit">Eliminar</button></form></div></TableCell></TableRow>)}</TableBody></Table>
    </main>
  );
}
