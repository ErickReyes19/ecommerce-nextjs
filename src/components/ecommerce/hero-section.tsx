import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center lg:py-36">
        <p className="mb-6 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Nueva coleccion disponible
        </p>
        <h1 className="max-w-4xl text-balance font-serif text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
          Calidad que se siente, estilo que se ve
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Descubre nuestra seleccion curada de productos premium. Diseno
          cuidado, materiales de primera y envio rapido a tu puerta.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/productos">
              Explorar productos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8"
          >
            <Link href="/productos?vista=categorias">Ver categorias</Link>
          </Button>
        </div>
      </div>

      {/* Decorative background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-secondary/50" />
        <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-secondary/30" />
      </div>
    </section>
  );
}
