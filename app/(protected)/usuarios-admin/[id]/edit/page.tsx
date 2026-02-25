import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getEcommerceUsuarioById } from "../../actions";
import { EcommerceUsuarioForm } from "../../components/form";

export default async function EditEcommerceUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [usuario, roles] = await Promise.all([
    getEcommerceUsuarioById(id),
    prisma.role.findMany({ select: { id: true, name: true } }),
  ]);

  if (!usuario) return notFound();

  return (
    <EcommerceUsuarioForm
      initialData={{
        id: usuario.id,
        name: usuario.name ?? "",
        email: usuario.email ?? "",
        roleId: usuario.roleId,
      }}
      roles={roles}
    />
  );
}
