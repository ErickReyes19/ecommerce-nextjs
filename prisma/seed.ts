import "dotenv/config";
import {
  CouponType,
  DiscountTarget,
  Prisma,
  PrismaClient,
  ShippingMethodType,
} from "@/lib/generated/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const ADMIN_PERMISSIONS = [
  "ver_permisos",
  "ver_roles",
  "crear_roles",
  "editar_roles",
  "ver_usuarios",
  "crear_usuario",
  "editar_usuario",
  "ver_profile",
  "ver_dashboard",
  "ver_productos_admin",
  "crear_productos_admin",
  "ver_categorias_admin",
  "ver_pedidos_admin",
  "ver_metodos_envio_admin",
  "ver_cupones_admin",
  "ver_reportes_admin",
  "ver_proveedores_admin",
  "crear_proveedores_admin",
  "editar_proveedores_admin",
  "eliminar_proveedores_admin",
  "ver_facturas",
] as const;

const CLIENT_PERMISSIONS = ["ver_mi_perfil", "ver_facturas"] as const;

const categoryTree = [
  { name: "Electrónica", slug: "electronica", children: ["smartphones", "laptops"] },
  { name: "Hogar", slug: "hogar", children: ["cocina"] },
] as const;

const brandNames = ["Apple", "Samsung", "Sony", "Xiaomi", "LG", "HP", "Lenovo", "Asus", "Philips", "Bosch"];

async function upsertPermission(nombre: string) {
  try {
    return await prisma.permiso.upsert({
      where: { nombre },
      update: {
        descripcion: `Permiso para ${nombre.replaceAll("_", " ")}`,
        activo: true,
      },
      create: {
        id: randomUUID(),
        nombre,
        descripcion: `Permiso para ${nombre.replaceAll("_", " ")}`,
        activo: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return prisma.permiso.findUnique({ where: { nombre } });
    }
    throw error;
  }
}

async function assignPermissions(rolId: string, permissionNames: readonly string[]) {
  const permissions = await prisma.permiso.findMany({
    where: { nombre: { in: [...permissionNames] } },
  });

  await Promise.all(
    permissions.map((permiso) =>
      prisma.rolPermiso.upsert({
        where: { rolId_permisoId: { rolId, permisoId: permiso.id } },
        update: {},
        create: { rolId, permisoId: permiso.id },
      }),
    ),
  );
}

async function seedLegacyAuth() {
  await Promise.all([...ADMIN_PERMISSIONS, ...CLIENT_PERMISSIONS].map((permiso) => upsertPermission(permiso)));

  const adminRole = await prisma.rol.upsert({
    where: { nombre: "ADMIN" },
    update: { descripcion: "Administrador del sistema", activo: true },
    create: { nombre: "ADMIN", descripcion: "Administrador del sistema", activo: true },
  });

  const clientRole = await prisma.rol.upsert({
    where: { nombre: "CLIENTE" },
    update: { descripcion: "Cliente de ecommerce", activo: true },
    create: { nombre: "CLIENTE", descripcion: "Cliente de ecommerce", activo: true },
  });

  await assignPermissions(adminRole.id, ADMIN_PERMISSIONS);
  await assignPermissions(clientRole.id, CLIENT_PERMISSIONS);

  const password = await bcrypt.hash("Admin123*", 10);
  const adminId = randomUUID();

  await prisma.usuarios.upsert({
    where: { email: "admin@ecommerce.local" },
    update: {
      usuario: "admin",
      nombre: "Administrador",
      rol_id: adminRole.id,
      contrasena: password,
      activo: true,
    },
    create: {
      id: adminId,
      usuario: "admin",
      email: "admin@ecommerce.local",
      nombre: "Administrador",
      contrasena: password,
      rol_id: adminRole.id,
      activo: true,
      DebeCambiarPassword: false,
    },
  });
}

async function seedEcommerce() {
  const rootCategories = await Promise.all(
    categoryTree.map((node) =>
      prisma.category.upsert({
        where: { slug: node.slug },
        update: { name: node.name },
        create: { name: node.name, slug: node.slug },
      }),
    ),
  );

  for (let i = 0; i < rootCategories.length; i++) {
    const root = rootCategories[i];
    const children = categoryTree[i].children;

    for (const child of children) {
      await prisma.category.upsert({
        where: { slug: child },
        update: { parentId: root.id },
        create: {
          name: child.charAt(0).toUpperCase() + child.slice(1),
          slug: child,
          parentId: root.id,
        },
      });
    }
  }

  const brands = await Promise.all(
    brandNames.map((name) =>
      prisma.brand.upsert({
        where: { slug: name.toLowerCase() },
        update: { name },
        create: { name, slug: name.toLowerCase() },
      }),
    ),
  );

  const allCategories = await prisma.category.findMany();

  const colorAttr = await prisma.attribute.upsert({
    where: { slug: "color" },
    update: {},
    create: { name: "Color", slug: "color" },
  });

  const sizeAttr = await prisma.attribute.upsert({
    where: { slug: "tamano" },
    update: {},
    create: { name: "Tamaño", slug: "tamano" },
  });

  const colorValues = ["negro", "blanco", "azul"];
  const sizeValues = ["s", "m", "l"];

  await Promise.all(
    colorValues.map((value) =>
      prisma.attributeValue.upsert({
        where: { attributeId_slug: { attributeId: colorAttr.id, slug: value } },
        update: { value },
        create: { attributeId: colorAttr.id, slug: value, value },
      }),
    ),
  );

  await Promise.all(
    sizeValues.map((value) =>
      prisma.attributeValue.upsert({
        where: { attributeId_slug: { attributeId: sizeAttr.id, slug: value } },
        update: { value: value.toUpperCase() },
        create: { attributeId: sizeAttr.id, slug: value, value: value.toUpperCase() },
      }),
    ),
  );

  for (let i = 1; i <= 30; i++) {
    const category = allCategories[i % allCategories.length];
    const brand = brands[i % brands.length];
    const slug = `producto-${i}`;
    const basePrice = new Prisma.Decimal(50 + i * 3);

    const product = await prisma.product.upsert({
      where: { slug },
      update: { name: `Producto ${i}`, basePrice, categoryId: category.id, brandId: brand.id },
      create: {
        name: `Producto ${i}`,
        slug,
        description: `Descripción completa del Producto ${i}`,
        shortDescription: `Resumen del Producto ${i}`,
        sku: `SKU-${i.toString().padStart(4, "0")}`,
        basePrice,
        compareAtPrice: basePrice.plus(20),
        categoryId: category.id,
        brandId: brand.id,
      },
    });

    await prisma.productVariant.upsert({
      where: { sku: `SKU-${i.toString().padStart(4, "0")}-A` },
      update: { stock: 10 + i },
      create: {
        productId: product.id,
        sku: `SKU-${i.toString().padStart(4, "0")}-A`,
        name: "Variante Base",
        price: basePrice,
        salePrice: i % 3 === 0 ? basePrice.minus(5) : null,
        stock: 10 + i,
        isDefault: true,
      },
    });

    await prisma.productImage.createMany({
      data: [
        {
          productId: product.id,
          url: `/uploads/seed/product-${(i % 5) + 1}.jpg`,
          alt: `Producto ${i} imagen principal`,
          isMain: true,
          sortOrder: 1,
        },
        {
          productId: product.id,
          url: `/uploads/seed/product-${((i + 1) % 5) + 1}.jpg`,
          alt: `Producto ${i} imagen secundaria`,
          isMain: false,
          sortOrder: 2,
        },
      ],
      skipDuplicates: true,
    });
  }

  await prisma.coupon.upsert({
    where: { code: "BIENVENIDA10" },
    update: {},
    create: {
      code: "BIENVENIDA10",
      type: CouponType.PERCENTAGE,
      target: DiscountTarget.GLOBAL,
      value: 10,
      maxDiscount: 25,
      startsAt: new Date(),
      usageLimit: 100,
    },
  });

  const zone = await prisma.shippingZone.upsert({
    where: { id: "default-zone" },
    update: { countries: "HN,SV,GT" },
    create: { id: "default-zone", name: "Centroamérica", countries: "HN,SV,GT" },
  });

  await prisma.shippingMethod.upsert({
    where: { id: "shipping-flat" },
    update: { price: 5 },
    create: {
      id: "shipping-flat",
      zoneId: zone.id,
      name: "Envío estándar",
      type: ShippingMethodType.FLAT,
      price: 5,
    },
  });

  await prisma.taxRate.upsert({
    where: { country_region: { country: "HN", region: "FM" } },
    update: { rate: 15 },
    create: { country: "HN", region: "FM", rate: 15 },
  });
}

async function main() {
  await seedLegacyAuth();
  await seedEcommerce();
  console.log("✅ Seed inicial completado (auth legado + ecommerce)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
