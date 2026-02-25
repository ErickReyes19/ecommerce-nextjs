import Link from "next/link";
import { deleteCategoria, getCategorias } from "./actions";

export default async function AdminCategoriasPage() {
  const categories = await getCategorias();

  return (
    <main className="space-y-3">
      <Link href="/categorias/create" className="underline">Nueva categoría</Link>
      {categories.map((c) => (
        <div key={c.id} className="rounded border p-3 flex items-center justify-between gap-4">
          <div>{c.name} {c.parent ? `· Padre: ${c.parent.name}` : ""}</div>
          <div className="flex gap-2">
            <Link href={`/categorias/${c.id}/edit`} className="underline">Editar</Link>
            <form action={deleteCategoria.bind(null, c.id)}><button className="underline" type="submit">Eliminar</button></form>
          </div>
        </div>
      ))}
    </main>
  );
}
