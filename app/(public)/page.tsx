import Link from "next/link";
import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/mi-perfil");

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <section className="container mx-auto px-4 py-20 text-center space-y-6">
        <Badge variant="outline">Nuevo ecommerce con Next.js + Prisma</Badge>
        <h1 className="text-5xl font-bold tracking-tight">Tu tienda moderna lista para escalar</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Catálogo, checkout con Stripe, panel admin y analíticas en una sola base sólida.</p>
        <div className="flex justify-center gap-3">
          <Button asChild size="lg"><Link href="/productos">Explorar productos</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/login">Iniciar sesión</Link></Button>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20 grid gap-4 md:grid-cols-3">
        {[
          ["Catálogo avanzado", "Filtros por categoría, precio, atributos y stock"],
          ["Checkout robusto", "Validación de stock, cupones, impuestos y envíos"],
          ["Backoffice completo", "Gestión de productos, pedidos, usuarios y reportes"],
        ].map(([title, desc]) => (
          <Card key={title}>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>{desc}</CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
