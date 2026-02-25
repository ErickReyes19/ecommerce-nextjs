import { redirect } from "next/navigation";

export default async function EditEcommerceUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/usuarios/${id}/edit`);
}
