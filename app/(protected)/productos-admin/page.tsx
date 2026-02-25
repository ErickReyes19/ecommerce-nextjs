import HeaderComponent from "@/components/HeaderComponent";
import { ListCheck } from "lucide-react";
import { getProductos } from "./actions";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import ProductosListMobile from "./components/productos-list-mobile";

export default async function AdminProductosPage() {
  const productos = await getProductos();
  const data = productos.map((producto) => ({ ...producto, categoryName: producto.category.name }));

  return (
    <div className="container mx-auto py-2">
      <HeaderComponent Icon={ListCheck} description="En este apartado podrá ver todos los productos" screenName="Productos" />
      <div className="hidden md:block"><DataTable columns={columns} data={data} /></div>
      <div className="block md:hidden"><ProductosListMobile productos={data} /></div>
    </div>
  );
}
