import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CategoriaForm } from "../../components/form";

export default async function EditCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categoria, categorias] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({ select: { id: true, name: true } }),
  ]);

  if (!categoria) return notFound();

  return (
    <CategoriaForm
      initialData={{
        id: categoria.id,
        name: categoria.name,
        slug: categoria.slug,
        description: categoria.description ?? "",
        parentId: categoria.parentId,
      }}
      categorias={categorias}
    />
  );
}
