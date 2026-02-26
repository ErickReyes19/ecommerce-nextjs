import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { getCategoriaById, getCategoriasSelector } from "../../actions";
import { CategoriaForm } from "../../components/form";

export default async function EditCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_categorias_admin")) return <NoAcceso />;

  const { id } = await params;
  const [categoria, categorias] = await Promise.all([getCategoriaById(id), getCategoriasSelector()]);

  if (!categoria) return notFound();

  return (
    <div>
      <HeaderComponent Icon={Pencil} description="En este apartado podrás editar una categoría" screenName="Editar Categoría" />
      <CategoriaForm initialData={{ id: categoria.id, name: categoria.name, slug: categoria.slug, description: categoria.description ?? "", parentId: categoria.parentId }} categorias={categorias} />
    </div>
  );
}
