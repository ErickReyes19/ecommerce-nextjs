import Link from "next/link";
import { Store } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Tienda: [
    { label: "Productos", href: "/productos" },
    { label: "Categorias", href: "/productos?vista=categorias" },
    { label: "Ofertas", href: "/productos?oferta=true" },
  ],
  Cuenta: [
    { label: "Iniciar sesion", href: "/login" },
    { label: "Mi perfil", href: "/perfil" },
    { label: "Mis pedidos", href: "/perfil" },
  ],
  Ayuda: [
    { label: "Preguntas frecuentes", href: "#" },
    { label: "Envios", href: "#" },
    { label: "Devoluciones", href: "#" },
  ],
};

export function StoreFooter() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              <span className="text-lg font-serif font-bold tracking-tight">
                Tienda
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tu destino para productos de calidad. Envios rapidos y atencion
              personalizada.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-muted-foreground">
            {new Date().getFullYear()} Tienda. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacidad
            </Link>
            <Link
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Terminos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
