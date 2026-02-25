// /pages/usuarios/[id]/editar/page.tsx

import { getRolesPermisosActivos } from "@/app/(protected)/roles/actions";
import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { getUsuarioById } from "../../actions";
import { Formulario } from "../../components/Form";

export default async function Edit({ params }: { params: { id: string } }) {



  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_usuario")) {

    return <NoAcceso />;
  }

  const usuario = await getUsuarioById(params.id);
  const roles = await getRolesPermisosActivos();


  if (!usuario) {
    redirect("/usuarios");
  }
  const initialData = {
    id: usuario.id,
    usuario: usuario.usuario ?? "",
    contrasena: "",
    rol_id: usuario.rol_id,
    activo: usuario.activo,
    email: usuario.email

  };

  return (
    <div>
      <HeaderComponent
        Icon={Pencil}
        description="En este apartado podrás editar un usuario"
        screenName="Editar Usuario"
      />
      <Formulario
        isUpdate={true}
        initialData={initialData}
        roles={roles}
      />
    </div>
  );
}
