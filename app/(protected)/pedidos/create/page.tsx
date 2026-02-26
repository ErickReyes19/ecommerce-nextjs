import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { PedidoForm } from "../components/form";

export default async function CreatePedidoPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_pedidos_admin")) return <NoAcceso />;

  return (
    <div>
      <HeaderComponent Icon={PlusCircle} description="En este apartado podrás crear un pedido" screenName="Crear Pedido" />
      <PedidoForm initialData={{ orderNumber: "", status: "PENDIENTE", subtotal: 0, grandTotal: 0, notes: "" }} />
    </div>
  );
}
