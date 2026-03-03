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

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await getSession();
  if (session) redirect("/mi-perfil");

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#2563eb33,transparent_45%),radial-gradient(circle_at_80%_10%,#7c3aed33,transparent_30%),radial-gradient(circle_at_30%_90%,#06b6d433,transparent_35%)]" />

      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden lg:block">
        <Image
          src="/images/login.png"
          alt="Escena editorial con periódico y café"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-950/55" />

        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <p className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
            Acceso exclusivo
          </p>

          <blockquote className="max-w-xl space-y-5">
            <p className="text-2xl font-semibold leading-relaxed text-white">
              &ldquo;Un dashboard limpio, rápido y diseñado para gestionar
              contenido sin fricción.&rdquo;
            </p>
            <footer className="text-sm text-white/80">
              <span className="font-semibold text-white">
                Sofía Martínez
              </span>{" "}
              &mdash; Editora digital
            </footer>
          </blockquote>
        </div>
        </section>

        <section className="relative flex flex-col items-center justify-center px-6 py-12 lg:px-16">
        <div className="mb-8 flex items-center gap-3">
          <Image
            src="https://d3dr34vkycigpz.cloudfront.net/wp-content/uploads/2025/09/TiempoHonduras-1-2.webp"
            alt="Logo de Diario Tiempo"
            width={180}
            height={36}
            className="h-10 w-auto"
            priority
          />
        </div>

        <div className="w-full max-w-md">
          <Card className="overflow-hidden border-white/15 bg-white/5 shadow-2xl backdrop-blur-xl">
            <div className="h-1 w-full bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400" />
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-3xl font-bold tracking-tight text-white">
                Iniciar sesión
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-slate-300">
                Bienvenido de vuelta. Ingresa tus credenciales para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="text-sm text-slate-300">
                    Cargando...
                  </div>
                }
              >
                <Login callbackUrl={searchParams.callbackUrl} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
        </section>
      </div>

    </main>
  );
}
