import Link from "next/link";
import { deleteCupon, getCupones } from "./actions";

export default async function AdminCuponesPage() {
  const coupons = await getCupones();
  return (
    <main className="space-y-3">
      <Link href="/cupones/create" className="underline">Nuevo cupón</Link>
      {coupons.map((c) => (
        <div key={c.id} className="rounded border p-3 flex items-center justify-between">
          <div>{c.code} · {c.type} · {Number(c.value)} · {c.active ? "Activo" : "Inactivo"}</div>
          <div className="flex gap-2">
            <Link href={`/cupones/${c.id}/edit`} className="underline">Editar</Link>
            <form action={deleteCupon.bind(null, c.id)}><button className="underline" type="submit">Eliminar</button></form>
          </div>
        </div>
      ))}
    </main>
  );
}
