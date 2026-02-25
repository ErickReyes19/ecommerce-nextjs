import HeaderComponent from "@/components/HeaderComponent";
import { ListCheck } from "lucide-react";
import { getCupones } from "./actions";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import CuponesListMobile from "./components/cupones-list-mobile";

export default async function AdminCuponesPage() {
  const cupones = await getCupones();
  return (
    <div className="container mx-auto py-2">
      <HeaderComponent Icon={ListCheck} description="En este apartado podrá ver todos los cupones" screenName="Cupones" />
      <div className="hidden md:block"><DataTable columns={columns} data={cupones} /></div>
      <div className="block md:hidden"><CuponesListMobile cupones={cupones} /></div>
    </div>
  );
}
