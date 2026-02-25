import { Truck, Shield, RefreshCw, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Envio rapido",
    description: "Entrega en 2-5 dias habiles a todo el pais",
  },
  {
    icon: Shield,
    title: "Pago seguro",
    description: "Transacciones protegidas con encriptacion SSL",
  },
  {
    icon: RefreshCw,
    title: "Devoluciones faciles",
    description: "30 dias para devolver sin preguntas",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description: "Atencion personalizada siempre que la necesites",
  },
];

export function FeaturesStrip() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
              <feature.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
