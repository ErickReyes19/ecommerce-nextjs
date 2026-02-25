import React from "react";
import { getSession } from "@/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { StoreNavbar } from "@/src/components/ecommerce/store-navbar";
import { StoreFooter } from "@/src/components/ecommerce/store-footer";
import { CartHydrator } from "@/src/components/ecommerce/cart-hydrator";

async function getCartCount() {
  try {
    const token = cookies().get("guest_cart")?.value;
    if (!token) return 0;
    const cart = await prisma.cart.findUnique({
      where: { token },
      include: { items: true },
    });
    return cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  } catch {
    return 0;
  }
}

const PublicLayout: React.FC<{ children: React.ReactNode }> = async ({
  children,
}) => {
  const [cartCount, session] = await Promise.all([getCartCount(), getSession()]);
  const accountHref = session ? "/mi-perfil" : "/login";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <CartHydrator />
      <StoreNavbar cartCount={cartCount} accountHref={accountHref} />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
};

export default PublicLayout;
