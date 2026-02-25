import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminProductosPage() {
  const products = await prisma.product.findMany({ include: { category: true }, take: 20 });
  return <Table><TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>SKU</TableHead><TableHead>Categoría</TableHead></TableRow></TableHeader><TableBody>{products.map((p) => <TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell>{p.sku}</TableCell><TableCell>{p.category.name}</TableCell></TableRow>)}</TableBody></Table>;
}
