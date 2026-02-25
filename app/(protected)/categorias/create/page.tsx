import HeaderComponent from "@/components/HeaderComponent";
import { prisma } from "@/lib/prisma";
import { PlusCircle } from "lucide-react";
import { CategoriaForm } from "../components/form";

export default async function CreateCategoriaPage() {
  const categorias = await prisma.category.findMany({ select: { id: true, name: true } });

  return (
    <div>
      <HeaderComponent Icon={PlusCircle} description="En este apartado podrás crear una categoría" screenName="Crear Categoría" />
      <CategoriaForm initialData={{ name: "", slug: "", description: "", parentId: null }} categorias={categorias} />
    </div>
  );
}
