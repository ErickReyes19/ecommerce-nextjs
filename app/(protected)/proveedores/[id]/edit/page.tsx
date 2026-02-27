import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { getProveedorById } from "../../actions";
import { ProveedorForm } from "../../components/form";

export default async function EditProveedorPage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_proveedores_admin")) return <NoAcceso />;

  const { id } = await params;
  const proveedor = await getProveedorById(id);
  if (!proveedor) return notFound();

  return (
    <div>
      <HeaderComponent Icon={Pencil} description="Actualiza datos del proveedor y servicios" screenName="Editar Proveedor" />
      <ProveedorForm
        initialData={{
          id: proveedor.id,
          name: proveedor.name,
          slug: proveedor.slug,
          description: proveedor.description ?? "",
          type: proveedor.type,
          active: proveedor.active,
          services: proveedor.services.map((service) => ({
            id: service.id,
            name: service.name,
            baseUrl: service.baseUrl,
            productEndpoint: service.productEndpoint,
            orderEndpoint: service.orderEndpoint,
            authType: service.authType,
            token: service.token ?? "",
            apiKey: service.apiKey ?? "",
            secretKey: service.secretKey ?? "",
            headersJson: service.headersJson ?? "",
            productMappingJson: service.productMappingJson ?? "",
            active: service.active,
          })),
        }}
      />
    </div>
  );
}
