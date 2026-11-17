import Link from "next/link";
import { Banknote, CreditCard, Heart } from "lucide-react";

/** Franja de confianza: solo hechos que la tienda puede sostener. */
export function FeaturesStrip() {
  return (
    <section aria-label="Comprar con confianza" className="mt-16 border-t border-border lg:mt-24">
      <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border lg:px-8">
        <li className="flex gap-3 md:pr-6">
          <CreditCard aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold">Pago con tarjeta a través de PixelPay</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Los datos de tu tarjeta los procesa PixelPay, no esta tienda.
            </p>
          </div>
        </li>
        <li className="flex gap-3 md:px-6">
          <Banknote aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold">Precios en lempiras</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Todos los precios están en lempiras, sin conversiones de moneda.
            </p>
          </div>
        </li>
        <li className="flex gap-3 md:pl-6">
          <Heart aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold">Guarda tus favoritos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <Link
                href="/lista-deseos"
                className="rounded-sm text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Ver mi lista de deseos
              </Link>
            </p>
          </div>
        </li>
      </ul>
    </section>
  );
}
