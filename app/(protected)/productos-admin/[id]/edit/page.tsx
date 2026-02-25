import HeaderComponent from "@/components/HeaderComponent";
import { prisma } from "@/lib/prisma";
import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { getProductoById } from "../../actions";
import { ProductoForm } from "../../components/form";

export default async function EditProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [producto, categorias, marcas] = await Promise.all([
    getProductoById(id),
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!producto) return notFound();

  const defaultVariant = producto.variants.find((variant) => variant.isDefault) ?? producto.variants[0];

  return (
    <div>
      <HeaderComponent Icon={Pencil} description="En este apartado podrás editar un producto" screenName="Editar Producto" />
      <ProductoForm initialData={{ id: producto.id, name: producto.name, slug: producto.slug, description: producto.description, shortDescription: producto.shortDescription, sku: producto.sku, basePrice: Number(producto.basePrice), compareAtPrice: producto.compareAtPrice ? Number(producto.compareAtPrice) : null, salePrice: defaultVariant?.salePrice ? Number(defaultVariant.salePrice) : null, stock: defaultVariant?.stock ?? 0, defaultVariantName: defaultVariant?.name ?? "Variante Base", defaultVariantWeight: defaultVariant?.weight ? Number(defaultVariant.weight) : null, active: producto.active, categoryId: producto.categoryId, brandId: producto.brandId }} categorias={categorias} marcas={marcas} />
    </div>
  );
}
