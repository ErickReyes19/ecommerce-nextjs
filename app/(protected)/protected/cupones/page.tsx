import { prisma } from "@/lib/prisma";

export default async function AdminCuponesPage() {
  const coupons = await prisma.coupon.findMany({ take: 20 });
  return <main className="space-y-2">{coupons.map((c) => <div key={c.id} className="rounded border p-3">{c.code} · {c.type} · {Number(c.value)} </div>)}</main>;
}
