import HeaderComponent from "@/components/HeaderComponent";
import { PlusCircle } from "lucide-react";
import { PedidoForm } from "../components/form";

export default function CreatePedidoPage() {
  return (
    <div>
      <HeaderComponent Icon={PlusCircle} description="En este apartado podrás crear un pedido" screenName="Crear Pedido" />
      <PedidoForm initialData={{ orderNumber: "", status: "PENDIENTE", subtotal: 0, grandTotal: 0, notes: "" }} />
    </div>
  );
}
