import { prisma } from "@/lib/prisma";
import { EcommerceUsuarioForm } from "../components/form";

export default async function CreateEcommerceUsuarioPage() {
  const roles = await prisma.role.findMany({ select: { id: true, name: true } });
  return <EcommerceUsuarioForm initialData={{ name: "", email: "", roleId: null }} roles={roles} />;
}
