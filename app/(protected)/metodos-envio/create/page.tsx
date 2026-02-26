import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Truck } from "lucide-react";
import { MetodoEnvioForm } from "../components/form";
import { getShippingZones } from "../actions";

export default async function CreateMetodoEnvioPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_metodos_envio_admin")) return <NoAcceso />;

  const zones = await getShippingZones();
  return (
    <div className="space-y-4">
      <HeaderComponent Icon={Truck} description="Crear método de envío" screenName="Nuevo método" />
      <MetodoEnvioForm initialData={{ zoneId: zones[0]?.id ?? "", name: "", type: "FLAT", price: 0, active: true }} zones={zones} />
    </div>
  );
}
