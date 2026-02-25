import { prisma } from "@/lib/prisma";
import { ProductoForm } from "../components/form";

export default async function CreateProductoPage() {
  const categorias = await prisma.category.findMany({ select: { id: true, name: true } });
  return <ProductoForm initialData={{ name: "", slug: "", description: "", sku: "", basePrice: 0, categoryId: "", brandId: null }} categorias={categorias} />;
}
