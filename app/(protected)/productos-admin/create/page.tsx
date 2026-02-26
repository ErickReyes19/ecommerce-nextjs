import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { PlusCircle } from "lucide-react";
import { getProductoFormOptions } from "../actions";
import { ProductoForm } from "../components/form";

export default async function CreateProductoPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("crear_productos_admin")) return <NoAcceso />;

  const { categorias, marcas } = await getProductoFormOptions();

  return (
    <div>
      <HeaderComponent Icon={PlusCircle} description="En este apartado podrás crear un producto" screenName="Crear Producto" />
      <ProductoForm initialData={{ name: "", slug: "", description: "", shortDescription: null, sku: "", basePrice: 0, compareAtPrice: null, salePrice: null, stock: 0, defaultVariantName: "Variante Base", defaultVariantWeight: null, active: true, categoryId: "", brandId: null }} categorias={categorias} marcas={marcas} />
    </div>
  );
}
