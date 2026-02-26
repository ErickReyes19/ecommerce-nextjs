import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { getProductoById, getProductoFormOptions } from "../../actions";
import { ProductoForm } from "../../components/form";

export default async function EditProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("editar_productos_admin")) return <NoAcceso />;

  const { id } = await params;
  const [producto, options] = await Promise.all([
    getProductoById(id),
    getProductoFormOptions(),
  ]);
  if (!producto) return notFound();

  const defaultVariant =
    producto.variants.find((variant) => variant.isDefault) ??
    producto.variants[0];

  return (
    <div>
      <HeaderComponent
        Icon={Pencil}
        description="En este apartado podrás editar un producto"
        screenName="Editar Producto"
      />
      <ProductoForm
        initialData={{
          id: producto.id,
          name: producto.name,
          slug: producto.slug,
          description: producto.description,
          shortDescription: producto.shortDescription,
          sku: producto.sku,
          basePrice: Number(producto.basePrice),
          compareAtPrice: producto.compareAtPrice
            ? Number(producto.compareAtPrice)
            : null,
          salePrice: defaultVariant?.salePrice
            ? Number(defaultVariant.salePrice)
            : null,
          stock: defaultVariant?.stock ?? 0,
          defaultVariantName: defaultVariant?.name ?? "Variante Base",
          defaultVariantWeight: defaultVariant?.weight
            ? Number(defaultVariant.weight)
            : null,
          active: producto.active,
          categoryId: producto.categoryId,
          brandId: producto.brandId,
          providerId: producto.providerId,
          providerServiceId: producto.providerServiceId,
          externalProductId: producto.externalProductId,
          syncMetadata: producto.syncMetadata,
          imageUrls: producto.images.map((image) => image.url).join("\n"),
        }}
        categorias={options.categorias}
        marcas={options.marcas}
        proveedores={options.proveedores}
      />
    </div>
  );
}
