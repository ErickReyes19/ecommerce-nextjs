import { notFound } from "next/navigation";
import HeaderComponent from "@/components/HeaderComponent";
import { Truck } from "lucide-react";
import { MetodoEnvioForm } from "../../components/form";
import { getMetodoEnvioById, getShippingZones } from "../../actions";

export default async function EditMetodoEnvioPage({ params }: { params: { id: string } }) {
  const [method, zones] = await Promise.all([getMetodoEnvioById(params.id), getShippingZones()]);
  if (!method) return notFound();

  return (
    <div className="space-y-4">
      <HeaderComponent Icon={Truck} description="Editar método de envío" screenName="Editar método" />
      <MetodoEnvioForm initialData={{ id: method.id, zoneId: method.zoneId, name: method.name, type: method.type, price: Number(method.price), active: method.active }} zones={zones} />
    </div>
  );
}
