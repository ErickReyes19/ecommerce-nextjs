import Link from "next/link";
import { StoreBrand } from "@/src/components/ecommerce/store-navbar";

const footerLinks = {
  Tienda: [
    { label: "Productos", href: "/productos" },
    { label: "Categorías", href: "/productos?vista=categorias" },
    { label: "Ofertas", href: "/productos?oferta=true" },
  ],
  Cuenta: [
    { label: "Iniciar sesión", href: "/login" },
    { label: "Mi perfil", href: "/perfil" },
    { label: "Mis pedidos", href: "/perfil" },
  ],
  Ayuda: [
    { label: "Preguntas frecuentes", href: "#" },
    { label: "Envíos", href: "#" },
    { label: "Devoluciones", href: "#" },
  ],
};

const linkClass =
  "rounded-sm text-sm text-pie-foreground/75 underline-offset-4 transition-colors hover:text-pie-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango focus-visible:ring-offset-2 focus-visible:ring-offset-pie";

export function StoreFooter() {
  return (
    <footer className="bg-pie text-pie-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <Link
              href="/"
              aria-label="Tienda, ir al inicio"
              className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango focus-visible:ring-offset-2 focus-visible:ring-offset-pie"
            >
              <StoreBrand />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-pie-foreground/75">
              Tienda en línea hondureña. Precios en lempiras y pago con tarjeta a través de PixelPay.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <nav key={title} aria-label={title} className="space-y-4">
              <h2 className="font-condensed text-lg font-bold">{title}</h2>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-pie-foreground/15 pt-8 text-xs text-pie-foreground/75 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Tienda. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className={linkClass}>
              Privacidad
            </Link>
            <Link href="#" className={linkClass}>
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
