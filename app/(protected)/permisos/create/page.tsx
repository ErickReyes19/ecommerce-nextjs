import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { FormularioPermiso } from "../components/Formulario";

export default async function CreatePermisoPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_permisos")) return <NoAcceso />;

  return (
    <div>
      <HeaderComponent
        Icon={PlusCircle}
        description="En este apartado podrá crear un permiso."
        screenName="Crear Permiso"
      />
      <FormularioPermiso isUpdate={false} initialData={{ nombre: "", descripcion: "", activo: true }} />
    </div>
  );
}
