import { prisma } from "@/lib/prisma";
import { CategoriaForm } from "../components/form";

export default async function CreateCategoriaPage() {
  const categorias = await prisma.category.findMany({ select: { id: true, name: true } });
  return <CategoriaForm initialData={{ name: "", slug: "", description: "", parentId: null }} categorias={categorias} />;
}
