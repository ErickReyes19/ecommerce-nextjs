"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Inicio", href: "#" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Paquetes", href: "#paquetes" },
  { label: "Preguntas", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
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
          ? "border-b border-border/50 bg-background/90 shadow-sm backdrop-blur-xl"
          : "bg-background/60 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="https://d3dr34vkycigpz.cloudfront.net/wp-content/uploads/2025/09/TiempoHonduras-1-2.webp"
            alt="Logo de Diario Tiempo"
            width={180}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Iniciar sesion
          </Link>
          <Button asChild size="sm" className="rounded-full px-6 shadow-sm">
            <Link href="/login">Suscribirme</Link>
          </Button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menu" : "Abrir menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="animate-in slide-in-from-top-2 fade-in-0 border-t border-border/50 bg-background px-6 py-5 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-3 border-t border-border/50 pt-4">
              <div className="flex items-center justify-between px-3">
                <span className="text-sm text-muted-foreground">Cambiar tema</span>
                <ThemeToggle />
              </div>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Iniciar sesion
              </Link>
              <Button asChild size="sm" className="rounded-full">
                <Link href="/login">Suscribirme</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
