import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Building2 } from "lucide-react";
import { getProveedores } from "./actions";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import ProveedoresListMobile from "./components/proveedores-list-mobile";

export default async function ProveedoresPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_proveedores_admin")) return <NoAcceso />;

  const proveedores = await getProveedores();
  const data = proveedores.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    type: item.type,
    active: item.active,
    servicesCount: item.services.length,
  }));

  return (
    <div className="container mx-auto py-2">
      <HeaderComponent Icon={Building2} description="Administra proveedores y sus servicios API" screenName="Proveedores" />
      <div className="hidden md:block"><DataTable columns={columns} data={data} /></div>
      <div className="block md:hidden"><ProveedoresListMobile proveedores={data} /></div>
    </div>
  );
}
