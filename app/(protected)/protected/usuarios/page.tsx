import Link from "next/link";
import { deleteEcommerceUsuario, getEcommerceUsuarios } from "./actions";

export default async function AdminUsuariosPage() {
  const users = await getEcommerceUsuarios();
  return (
    <main className="space-y-3">
      <Link href="/protected/usuarios/create" className="underline">Nuevo usuario</Link>
      {users.map((u) => (
        <div key={u.id} className="rounded border p-3 flex items-center justify-between">
          <div>{u.email} · {u.role?.name ?? "sin rol"}</div>
          <div className="flex gap-2">
            <Link href={`/protected/usuarios/${u.id}/edit`} className="underline">Editar</Link>
            <form action={deleteEcommerceUsuario.bind(null, u.id)}><button className="underline" type="submit">Eliminar</button></form>
          </div>
        </div>
      ))}
    </main>
  );
}
