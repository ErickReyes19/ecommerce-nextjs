import HeaderComponent from "@/components/HeaderComponent";
import { prisma } from "@/lib/prisma";
import { PlusCircle } from "lucide-react";
import { ProductoForm } from "../components/form";

export default async function CreateProductoPage() {
  const categorias = await prisma.category.findMany({ select: { id: true, name: true } });

  return (
    <div>
      <HeaderComponent Icon={PlusCircle} description="En este apartado podrás crear un producto" screenName="Crear Producto" />
      <ProductoForm initialData={{ name: "", slug: "", description: "", shortDescription: null, sku: "", basePrice: 0, compareAtPrice: null, salePrice: null, stock: 0, active: true, categoryId: "", brandId: null }} categorias={categorias} />
    </div>
  );
}
