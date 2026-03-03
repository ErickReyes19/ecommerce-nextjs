"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, ShoppingBag, Search, Circle, Store, Heart } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "/productos" },
  { label: "Categorias", href: "/productos?vista=categorias" },
];

export function StoreNavbar({ cartCount = 0, accountHref = "/login" }: { cartCount?: number; accountHref?: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/50 bg-background/95 shadow-sm backdrop-blur-xl"
          : "bg-background/80 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Store className="h-6 w-6 text-foreground" />
          <span className="text-xl font-serif font-bold tracking-tight text-foreground">
            Tienda
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/productos">
              <Search className="h-4 w-4" />
              <span className="sr-only">Buscar</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/lista-deseos">
              <Heart className="h-4 w-4" />
              <span className="sr-only">Lista de deseos</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href={accountHref}>
              <Circle className="h-4 w-4" />
              <span className="sr-only">Mi cuenta</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            asChild
          >
            <Link href="/carrito">
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]">
                  {cartCount}
                </Badge>
              )}
              <span className="sr-only">Carrito</span>
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/lista-deseos">
              <Heart className="h-4 w-4" />
              <span className="sr-only">Lista de deseos</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            asChild
          >
            <Link href="/carrito">
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]">
                  {cartCount}
                </Badge>
              )}
              <span className="sr-only">Carrito</span>
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
              <nav className="flex flex-col gap-1 pt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-4 border-t border-border" />
                <Link
                  href="/lista-deseos"
                  className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Lista de deseos
                </Link>
                <Link
                  href={accountHref}
                  className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Iniciar sesion
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
