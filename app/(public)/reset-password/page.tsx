import { getSession } from '@/auth';
import { ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import ResetPassword from './components/form';

export default async function Page() {
  const session = await getSession();
  if (!session?.IdUser || !session.DebeCambiar) {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="hidden bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 p-8 md:block">
              <div className="flex h-full flex-col justify-between">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                  <ShieldCheck className="h-4 w-4" />
                  Seguridad de cuenta
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Actualiza tu contraseña</h1>
                  <p className="mt-3 text-sm text-slate-200/90">
                    Por seguridad, debes establecer una nueva contraseña antes de continuar usando la plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-semibold">Cambio de contraseña</h2>
              <p className="mt-1 text-sm text-slate-300">Ingresa y confirma tu nueva contraseña para continuar.</p>

              <div className="mt-6">
                <Suspense fallback={<div className="text-center text-slate-300">Cargando…</div>}>
                  <ResetPassword username={session.User} />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
