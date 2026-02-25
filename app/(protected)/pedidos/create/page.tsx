import { PedidoForm } from "../components/form";

export default function CreatePedidoPage() {
  return <PedidoForm initialData={{ orderNumber: "", status: "PENDIENTE", subtotal: 0, grandTotal: 0, notes: "" }} />;
}
