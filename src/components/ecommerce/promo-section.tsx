import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function PromoSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="relative overflow-hidden rounded-3xl bg-foreground text-background">
        <div className="grid items-center md:grid-cols-2">
          <div className="p-10 md:p-16">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-background/60">
              Oferta especial
            </p>
            <h2 className="mb-4 font-serif text-3xl font-bold leading-tight md:text-4xl">
              Nuevos productos cada semana
            </h2>
            <p className="mb-8 leading-relaxed text-background/70">
              Suscribete a nuestro boletin y recibe un 10% de descuento en tu
              primera compra. No te pierdas las ultimas novedades.
            </p>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="rounded-full px-8"
            >
              <Link href="/productos">
                Comprar ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="relative hidden aspect-square md:block">
            <Image
              src="/images/hero-store.jpg"
              alt="Productos destacados"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
