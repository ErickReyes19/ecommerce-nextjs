import { prisma } from "@/lib/prisma";

export default async function AdminCategoriasPage() {
  const categories = await prisma.category.findMany({ include: { children: true } });
  return <main className="space-y-2">{categories.map((c) => <div key={c.id} className="rounded border p-3">{c.name} ({c.children.length} subcategorías)</div>)}</main>;
}
