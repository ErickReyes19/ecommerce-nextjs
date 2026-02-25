import { notFound } from "next/navigation";
import { getCuponById } from "../../actions";
import { CuponForm } from "../../components/form";

export default async function EditCuponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cupon = await getCuponById(id);
  if (!cupon) return notFound();

  return (
    <CuponForm
      initialData={{
        id: cupon.id,
        code: cupon.code,
        type: cupon.type,
        target: cupon.target,
        value: Number(cupon.value),
        active: cupon.active,
      }}
    />
  );
}
