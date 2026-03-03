import { getSession } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ShieldCheck, Gauge, Headphones } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Login from "../components/formLogin";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Acceso seguro",
    text: "Autenticación protegida y sesiones listas para tu equipo editorial.",
  },
  {
    icon: Gauge,
    title: "Flujo más rápido",
    text: "Publica y administra contenido sin interrupciones desde un panel optimizado.",
  },
  {
    icon: Headphones,
    title: "Soporte cercano",
    text: "Tu redacción conectada con asistencia en cada paso del proceso.",
  },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await getSession();
  if (session) redirect("/mi-perfil");

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_10%_10%,#38bdf833,transparent_35%),radial-gradient(circle_at_90%_20%,#818cf833,transparent_30%),radial-gradient(circle_at_50%_85%,#14b8a633,transparent_35%)]" />
      <div className="pointer-events-none absolute -left-20 top-24 -z-10 h-72 w-72 rounded-full bg-cyan-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-16 -z-10 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />

      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_80px_-35px_rgba(15,23,42,0.45)]">
          <Image
            src="/images/login.png"
            alt="Escena editorial con periódico y café"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-800/30" />

          <div className="relative flex h-full flex-col justify-between p-8 text-white lg:p-10">
            <div className="space-y-4">
              <Badge className="w-fit rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-white/20">
                Plataforma editorial
              </Badge>
              <h1 className="max-w-lg text-3xl font-semibold leading-tight lg:text-4xl">
                Una experiencia más moderna para entrar y gestionar tu contenido.
              </h1>
              <p className="max-w-md text-sm text-white/80 lg:text-base">
                Tu panel de trabajo ahora se siente más limpio, visual y claro desde la pantalla de acceso.
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {highlights.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <Icon className="mb-3 size-4 text-cyan-200" />
                  <h2 className="text-sm font-semibold">{title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-white/75">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <Card className="w-full max-w-lg overflow-hidden rounded-3xl border-slate-200 bg-white/95 shadow-[0_20px_80px_-45px_rgba(15,23,42,0.7)] backdrop-blur-xl">
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />

            <CardHeader className="space-y-4 pb-2">
              <Image
                src="https://d3dr34vkycigpz.cloudfront.net/wp-content/uploads/2025/09/TiempoHonduras-1-2.webp"
                alt="Logo de Diario Tiempo"
                width={190}
                height={36}
                className="h-10 w-auto"
                priority
              />
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
                  <Sparkles className="size-6 text-cyan-500" />
                  Iniciar sesión
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-slate-500">
                  Accede a tu cuenta para administrar publicaciones, métricas y tareas del equipo.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <Suspense fallback={<div className="text-sm text-slate-500">Cargando...</div>}>
                <Login callbackUrl={searchParams.callbackUrl} />
              </Suspense>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
