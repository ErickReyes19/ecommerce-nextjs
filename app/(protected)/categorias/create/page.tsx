import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { getCategoriasSelector } from "../actions";
import { CategoriaForm } from "../components/form";

export default async function CreateCategoriaPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_categorias_admin")) return <NoAcceso />;

  const categorias = await getCategoriasSelector();

  return (
    <div>
      <HeaderComponent Icon={PlusCircle} description="En este apartado podrás crear una categoría" screenName="Crear Categoría" />
      <CategoriaForm initialData={{ name: "", slug: "", description: "", parentId: null }} categorias={categorias} />
    </div>
  );
}
