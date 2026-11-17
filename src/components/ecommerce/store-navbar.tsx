"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "/productos" },
  { label: "Categorías", href: "/productos?vista=categorias" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Marca de la tienda: una etiqueta de precio pequeña y el nombre en Archivo condensada. */
export function StoreBrand({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span aria-hidden="true" className="price-tag block h-4 w-6 bg-mango text-[16px]" />
      <span className="font-condensed text-[26px] font-extrabold leading-none tracking-tight">Tienda</span>
    </span>
  );
}

function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mango px-1 text-[10px] font-bold leading-none text-mango-foreground">
      {count}
    </span>
  );
}

export function StoreNavbar({
  cartCount = 0,
  accountHref = "/login",
  themeClassName,
}: {
  cartCount?: number;
  accountHref?: string;
  /** Clases de tema de la tienda para contenido en portales (menú móvil), que queda fuera del layout. */
  themeClassName?: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const cartLabel = cartCount > 0 ? `Carrito, ${cartCount} ${cartCount === 1 ? "producto" : "productos"}` : "Carrito";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-border bg-background/95 backdrop-blur-xl" : "border-b border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Tienda, ir al inicio" className={cn("rounded-sm", focusRing)}>
          <StoreBrand />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : false;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground",
                  focusRing,
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <form action="/productos" role="search" className="mr-2 hidden lg:block">
            <label htmlFor="barra-busqueda" className="sr-only">
              Buscar productos
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="barra-busqueda"
                name="q"
                type="search"
                placeholder="Buscar"
                className={cn(
                  "h-10 w-52 rounded-full border border-input bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground",
                  focusRing,
                )}
              />
            </div>
          </form>
          <Button variant="ghost" size="icon" className={cn("rounded-full lg:hidden", focusRing)} asChild>
            <Link href="/productos">
              <Search className="h-4 w-4" />
              <span className="sr-only">Buscar</span>
            </Link>
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className={cn("rounded-full", focusRing)} asChild>
            <Link href="/lista-deseos">
              <Heart className="h-4 w-4" />
              <span className="sr-only">Lista de deseos</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className={cn("rounded-full", focusRing)} asChild>
            <Link href={accountHref}>
              <User className="h-4 w-4" />
              <span className="sr-only">Mi cuenta</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className={cn("relative rounded-full", focusRing)} asChild>
            <Link href="/carrito" aria-label={cartLabel}>
              <ShoppingBag className="h-4 w-4" />
              <CartBadge count={cartCount} />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <Button variant="ghost" size="icon" className={cn("rounded-full", focusRing)} asChild>
            <Link href="/lista-deseos">
              <Heart className="h-4 w-4" />
              <span className="sr-only">Lista de deseos</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className={cn("relative rounded-full", focusRing)} asChild>
            <Link href="/carrito" aria-label={cartLabel}>
              <ShoppingBag className="h-4 w-4" />
              <CartBadge count={cartCount} />
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("rounded-full", focusRing)}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className={cn(themeClassName, "w-80 bg-background text-foreground")}>
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <StoreBrand className="pt-1" />
              <nav aria-label="Principal" className="flex flex-col gap-1 pt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn("rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-accent", focusRing)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-4 border-t border-border" />
                <Link
                  href="/lista-deseos"
                  className={cn("rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-accent", focusRing)}
                >
                  Lista de deseos
                </Link>
                <Link
                  href={accountHref}
                  className={cn("rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-accent", focusRing)}
                >
                  Mi cuenta
                </Link>
                <div className="flex items-center justify-between px-3 py-3">
                  <span className="text-sm text-muted-foreground">Tema</span>
                  <ThemeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
