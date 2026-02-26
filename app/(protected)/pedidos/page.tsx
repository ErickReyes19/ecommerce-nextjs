import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { ListCheck } from "lucide-react";
import { getPedidos } from "./actions";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import PedidosListMobile from "./components/pedidos-list-mobile";

export default async function AdminPedidosPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_pedidos_admin")) return <NoAcceso />;

  const pedidos = await getPedidos();
  return (
    <div className="container mx-auto py-2">
      <HeaderComponent Icon={ListCheck} description="En este apartado podrá ver todos los pedidos" screenName="Pedidos" />
      <div className="hidden md:block"><DataTable columns={columns} data={pedidos} /></div>
      <div className="block md:hidden"><PedidosListMobile pedidos={pedidos} /></div>
    </div>
  );
}
