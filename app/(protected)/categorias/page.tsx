import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { ListCheck } from "lucide-react";
import { getCategorias } from "./actions";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import CategoriasListMobile from "./components/categorias-list-mobile";

export default async function AdminCategoriasPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_categorias_admin")) return <NoAcceso />;

  const categorias = await getCategorias();
  const data = categorias.map((categoria) => ({ ...categoria, parentName: categoria.parent?.name ?? "Sin categoría padre" }));

  return (
    <div className="container mx-auto py-2">
      <HeaderComponent Icon={ListCheck} description="En este apartado podrá ver todas las categorías" screenName="Categorías" />
      <div className="hidden md:block"><DataTable columns={columns} data={data} /></div>
      <div className="block md:hidden"><CategoriasListMobile categorias={data} /></div>
    </div>
  );
}
