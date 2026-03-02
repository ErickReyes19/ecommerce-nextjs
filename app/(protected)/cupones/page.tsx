import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { ListCheck } from "lucide-react";
import { getCupones } from "./actions";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import CuponesListMobile from "./components/cupones-list-mobile";

export default async function AdminCuponesPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_cupones_admin")) return <NoAcceso />;

  const cupones = await getCupones();
  return (
    <div className="container mx-auto py-2">
      <HeaderComponent Icon={ListCheck} description="En este apartado podrá ver todos los cupones" screenName="Cupones" />
      <div className="hidden md:block">
        <DataTable columns={columns} data={cupones.map(cupon => ({
          id: cupon.id,
          code: cupon.code,
          type: cupon.type,
          target: cupon.target,
          value: typeof cupon.value === "object" && "toNumber" in cupon.value ? cupon.value.toNumber() : Number(cupon.value),
          active: cupon.active,
        }))} />
      </div>
      <div className="block md:hidden">
        <CuponesListMobile cupones={cupones.map(cupon => ({
          id: cupon.id,
          code: cupon.code,
          type: cupon.type,
          target: cupon.target,
          value: typeof cupon.value === "object" && "toNumber" in cupon.value ? cupon.value.toNumber() : Number(cupon.value),
          active: cupon.active,
        }))} />
      </div>
    </div>
  );
}
