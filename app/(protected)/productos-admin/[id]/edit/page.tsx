import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getProductoById } from "../../actions";
import { ProductoForm } from "../../components/form";

export default async function EditProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [producto, categorias] = await Promise.all([
    getProductoById(id),
    prisma.category.findMany({ select: { id: true, name: true } }),
  ]);
  if (!producto) return notFound();

  return (
    <ProductoForm
      initialData={{
        id: producto.id,
        name: producto.name,
        slug: producto.slug,
        description: producto.description,
        sku: producto.sku,
        basePrice: Number(producto.basePrice),
        categoryId: producto.categoryId,
        brandId: producto.brandId,
      }}
      categorias={categorias}
    />
  );
}
