import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { ListCheck } from "lucide-react";
import { getProductos } from "./actions";
import { columns, type ProductListRow } from "./components/columns";
import { DataTable } from "./components/data-table";
import ProductosListMobile from "./components/productos-list-mobile";

export default async function AdminProductosPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_productos_admin")) return <NoAcceso />;

  const productos = await getProductos();
  const data: ProductListRow[] = productos.map((producto) => ({
    id: producto.id,
    name: producto.name,
    sku: producto.sku,
    basePrice: Number(producto.basePrice),
    categoryName: producto.category.name,
    providerName: producto.provider?.name ?? "Interno",
  }));

  return (
    <div className="container mx-auto py-2">
      <HeaderComponent Icon={ListCheck} description="En este apartado podrá ver todos los productos" screenName="Productos" />
      <div className="hidden md:block"><DataTable columns={columns} data={data} /></div>
      <div className="block md:hidden"><ProductosListMobile productos={data} /></div>
    </div>
  );
}
