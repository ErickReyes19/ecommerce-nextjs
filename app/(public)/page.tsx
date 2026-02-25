import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles, Truck } from "lucide-react";

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

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-muted/40">
      <section className="container mx-auto grid gap-8 px-4 py-16 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <Badge variant="outline" className="rounded-full px-3 py-1">Diseño enfocado a conversión</Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Tu tienda con experiencia premium para cliente y administrador</h1>
          <p className="max-w-xl text-muted-foreground">
            Mejoramos el flujo de negocio para que comprar sea simple, rápido e intuitivo; y para que administrar productos, envíos y reportes sea claro desde el panel.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-7"><Link href="/productos">Ir a la tienda</Link></Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-7"><Link href="/dashboard">Ver dashboard</Link></Button>
          </div>
        </div>

        <Card className="border-primary/20 bg-card/90 shadow-xl backdrop-blur">
          <CardHeader><CardTitle>Empieza a comprar</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Busca productos y recibe novedades de ofertas semanales.</p>
            <div className="flex gap-2">
              <Input placeholder="Buscar productos, marcas, categorías..." />
              <Button asChild><Link href="/productos">Buscar</Link></Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {["Electrónica", "Hogar", "Moda", "Deportes"].map((tag) => (
                <Badge key={tag} variant="secondary" className="justify-center rounded-full px-3 py-1">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container mx-auto px-4 pb-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Módulos UI/UX del cliente</h2>
            <p className="text-sm text-muted-foreground">Flujo de compra optimizado desde descubrimiento hasta recompra.</p>
          </div>
          <Button asChild variant="link" className="px-0"><Link href="/productos">Explorar catálogo completo</Link></Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {uxModules.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="transition hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <div className="rounded-xl bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold">¿Listo para una experiencia e-commerce más intuitiva?</h3>
              <p className="text-sm text-muted-foreground">Administra envíos, pedidos y productos en un flujo claro para tu operación diaria.</p>
            </div>
            <Button asChild size="lg" className="gap-2"><Link href="/login">Entrar al sistema <ArrowRight className="h-4 w-4" /></Link></Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
