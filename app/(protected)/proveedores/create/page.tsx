import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { ProveedorForm } from "../components/form";

export default async function CreateProveedorPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_proveedores_admin")) return <NoAcceso />;

  return (
    <div>
      <HeaderComponent Icon={PlusCircle} description="Crea un proveedor y sus integraciones" screenName="Crear Proveedor" />
      <ProveedorForm initialData={{ name: "", slug: "", description: "", type: "API", active: true, services: [{ name: "", baseUrl: "", productEndpoint: "/products", orderEndpoint: "/orders", authType: "BEARER", token: "", apiKey: "", secretKey: "", headersJson: "", productMappingJson: "", active: true }] }} />
    </div>
  );
}
