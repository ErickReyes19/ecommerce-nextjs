import HeaderComponent from "@/components/HeaderComponent";
import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { getCuponById } from "../../actions";
import { CuponForm } from "../../components/form";

export default async function EditCuponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cupon = await getCuponById(id);
  if (!cupon) return notFound();

  return (
    <div>
      <HeaderComponent Icon={Pencil} description="En este apartado podrás editar un cupón" screenName="Editar Cupón" />
      <CuponForm initialData={{ id: cupon.id, code: cupon.code, type: cupon.type, target: cupon.target, value: Number(cupon.value), active: cupon.active }} />
    </div>
  );
}
