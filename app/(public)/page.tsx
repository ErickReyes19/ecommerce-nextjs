import Link from "next/link";
import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MiniCart } from "@/src/components/ecommerce/mini-cart";
import { HeartHandshake, ShieldCheck, Sparkles, Truck } from "lucide-react";

const customerLinks = [
  { label: "Inicio", href: "/" },
  { label: "Tienda", href: "/productos" },
  { label: "Categorías", href: "/productos" },
  { label: "Ofertas", href: "/productos" },
  { label: "Mi perfil", href: "/perfil" },
];

const uxModules = [
  {
    icon: Sparkles,
    title: "Descubrimiento rápido",
    description:
      "Búsqueda inteligente, navegación por categorías y recomendaciones para llegar al producto ideal en menos clics.",
  },
  {
    icon: Truck,
    title: "Compra sin fricción",
    description:
      "Carrito visible, resumen de costos claro y checkout guiado para mejorar la conversión desde móvil y escritorio.",
  },
  {
    icon: ShieldCheck,
    title: "Confianza total",
    description:
      "Pagos seguros, validación de stock y estados del pedido en tiempo real para reducir abandonos de carrito.",
  },
  {
    icon: HeartHandshake,
    title: "Relación postventa",
    description:
      "Seguimiento de pedidos, soporte y promociones personalizadas para aumentar recurrencia y retención.",
  },
];

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/mi-perfil");

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <Badge className="rounded-full px-3 py-1">Ecommerce Next</Badge>
            <span className="text-sm text-muted-foreground">Experiencia cliente</span>
          </div>

          <nav className="order-3 flex w-full items-center justify-center gap-1 md:order-none md:w-auto md:gap-2">
            {customerLinks.map((link) => (
              <Button key={link.href + link.label} asChild variant="ghost" className="rounded-full">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <MiniCart count={0} />
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto grid gap-8 px-4 py-16 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <Badge variant="outline" className="rounded-full px-3 py-1">
            UX orientada a conversión
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Tienda, carrito y checkout en una landing pensada para vender más
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Reforzamos la navegación para el cliente final con acceso directo a tienda, carrito,
            perfil y ofertas. Además, cada módulo resalta beneficios reales para impulsar la compra.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link href="/productos">Ir a la tienda</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-7">
              <Link href="/carrito">Ver carrito</Link>
            </Button>
          </div>
        </div>

        <Card className="border-primary/20 bg-card/80 shadow-lg">
          <CardHeader>
            <CardTitle>Empieza a comprar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Busca productos y recibe novedades de ofertas semanales.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Buscar productos, marcas, categorías..." />
              <Button asChild>
                <Link href="/productos">Buscar</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {["Electrónica", "Hogar", "Moda", "Deportes"].map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-full px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Módulos UI/UX del cliente</h2>
            <p className="text-sm text-muted-foreground">
              Flujo de compra optimizado desde descubrimiento hasta recompra.
            </p>
          </div>
          <Button asChild variant="link" className="px-0">
            <Link href="/productos">Explorar catálogo completo</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {uxModules.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="transition-transform hover:-translate-y-0.5 hover:shadow-md">
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
    </main>
  );
}
