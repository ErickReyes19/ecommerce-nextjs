import { getSession } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Login from "../components/formLogin";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/mi-perfil");

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Lado izquierdo - Formulario */}
      {/* Lado derecho - Imagen */}
      <section className="relative hidden lg:block">
        <Image
          src="/images/login.png"
          alt="Escena editorial con periódico y café"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay sutil */}
        <div className="absolute inset-0 bg-primary/30" />

        {/* Texto sobre la imagen */}
        <div className="absolute inset-0 flex flex-col  p-12 ">
          <blockquote className="max-w-lg space-y-4">
            <p className="text-lg font-medium leading-relaxed text-primary-foreground">
              &ldquo;Desde que me suscribí a Flip, empiezo cada mañana con los
              mejores artículos. La experiencia de lectura es impecable.&rdquo;
            </p>
            <footer className="text-sm text-primary-foreground/80">
              <span className="font-semibold text-primary-foreground">
                Sofía Martínez
              </span>{" "}
              &mdash; Lectora desde 2023
            </footer>
          </blockquote>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center px-6 py-12 lg:px-16">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <Image
            src="https://d3dr34vkycigpz.cloudfront.net/wp-content/uploads/2025/09/TiempoHonduras-1-2.webp"
            alt="Logo de Diario Tiempo"
            width={180}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </div>

        <div className="w-full max-w-md">
          <Card className="border-border/60 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Iniciar sesión
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Ingresa tus credenciales para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="text-sm text-muted-foreground">
                    Cargando...
                  </div>
                }
              >
                <Login />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </section>


    </main>
  );
}
