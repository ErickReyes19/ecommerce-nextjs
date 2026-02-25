import HeaderComponent from "@/components/HeaderComponent";
import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { getPedidoById } from "../../actions";
import { PedidoForm } from "../../components/form";

export default async function EditPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pedido = await getPedidoById(id);
  if (!pedido) return notFound();

  return (
    <div>
      <HeaderComponent Icon={Pencil} description="En este apartado podrás editar un pedido" screenName="Editar Pedido" />
      <PedidoForm initialData={{ id: pedido.id, orderNumber: pedido.orderNumber, status: pedido.status, subtotal: Number(pedido.subtotal), grandTotal: Number(pedido.grandTotal), notes: pedido.notes ?? "" }} />
    </div>
  );
}
