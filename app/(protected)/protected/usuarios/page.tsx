import { prisma } from "@/lib/prisma";

export default async function AdminUsuariosPage() {
  const users = await prisma.user.findMany({ include: { role: true }, take: 30 });
  return <main className="space-y-2">{users.map((u) => <div key={u.id} className="rounded border p-3">{u.email} · {u.role?.name ?? "sin rol"}</div>)}</main>;
}
