import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Clock3,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  WalletCards,
} from "lucide-react";

const keyBenefits = [
  {
    icon: Store,
    title: "Miles de productos, muchas tiendas",
    description:
      "Compara opciones entre tiendas verificadas en un solo lugar y encuentra lo que necesitas al mejor precio.",
  },
  {
    icon: WalletCards,
    title: "Pagos simples y seguros",
    description:
      "Paga con métodos confiables y revisa el total antes de confirmar tu compra, sin cargos sorpresa.",
  },
  {
    icon: Truck,
    title: "Envíos con seguimiento",
    description:
      "Sigue cada pedido desde la confirmación hasta la entrega con actualizaciones claras en tiempo real.",
  },
  {
    icon: ShieldCheck,
    title: "Compra con confianza",
    description:
      "Opiniones reales, políticas transparentes y soporte para ayudarte si algo no sale como esperabas.",
  },
];

const highlightedCategories = [
  "Moda y accesorios",
  "Tecnología",
  "Hogar y cocina",
  "Belleza y cuidado personal",
  "Deportes",
  "Juguetes y bebés",
];

const shoppingFlow = [
  {
    icon: ShoppingBag,
    title: "Descubre",
    text: "Explora productos por categorías, tendencias o recomendaciones personalizadas.",
  },
  {
    icon: Clock3,
    title: "Compara",
    text: "Revisa precios, tiempos de entrega y calificaciones para elegir mejor.",
  },
  {
    icon: Truck,
    title: "Recibe",
    text: "Finaliza tu compra en minutos y da seguimiento al envío desde tu cuenta.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <section className="container mx-auto grid gap-10 px-4 pb-12 pt-16 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <Badge variant="outline" className="rounded-full px-3 py-1">
            Marketplace para cliente final
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Todo lo que quieres comprar, en una sola plataforma
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Encuentra productos de diferentes tiendas, compara fácilmente y compra con seguridad. Diseñamos una
            experiencia rápida para que descubras, elijas y recibas sin complicaciones.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link href="/productos">Explorar productos</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-7">
              <Link href="/carrito">Ver mi carrito</Link>
            </Button>
          </div>
        </div>

        <Card className="border-primary/20 bg-card/90 shadow-xl backdrop-blur">
          <CardHeader>
            <CardTitle>Encuentra más rápido lo que buscas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Busca por producto, marca o categoría y descubre ofertas destacadas de múltiples tiendas.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Ej: audífonos bluetooth, cafetera, tenis running..." />
              <Button asChild>
                <Link href="/productos">Buscar</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {highlightedCategories.slice(0, 4).map((category) => (
                <Badge key={category} variant="secondary" className="justify-center rounded-full px-3 py-1">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container mx-auto px-4 pb-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">¿Por qué comprar aquí?</h2>
            <p className="text-sm text-muted-foreground">
              Una experiencia enfocada al comprador final: variedad, confianza y facilidad de compra.
            </p>
          </div>
          <Button asChild variant="link" className="px-0">
            <Link href="/productos">Ver todo el catálogo</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {keyBenefits.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="transition hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Compra en 3 pasos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {shoppingFlow.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl bg-background p-4">
                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <Card>
          <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold">Empieza tu próxima compra hoy</h3>
              <p className="text-sm text-muted-foreground">
                Explora categorías como {highlightedCategories.join(", ")} y mucho más, todo desde una sola plataforma.
              </p>
            </div>
            <Button asChild size="lg" className="gap-2">
              <Link href="/productos">
                Ir a comprar <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
