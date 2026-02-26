import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { CuponForm } from "../components/form";

export default async function CreateCuponPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_cupones_admin")) return <NoAcceso />;

  return (
    <div>
      <HeaderComponent Icon={PlusCircle} description="En este apartado podrás crear un cupón" screenName="Crear Cupón" />
      <CuponForm initialData={{ code: "", type: "PERCENTAGE", target: "GLOBAL", value: 0, active: true }} />
    </div>
  );
}
