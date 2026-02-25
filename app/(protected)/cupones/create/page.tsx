import HeaderComponent from "@/components/HeaderComponent";
import { PlusCircle } from "lucide-react";
import { CuponForm } from "../components/form";

export default function CreateCuponPage() {
  return (
    <div>
      <HeaderComponent Icon={PlusCircle} description="En este apartado podrás crear un cupón" screenName="Crear Cupón" />
      <CuponForm initialData={{ code: "", type: "PERCENTAGE", target: "GLOBAL", value: 0, active: true }} />
    </div>
  );
}
