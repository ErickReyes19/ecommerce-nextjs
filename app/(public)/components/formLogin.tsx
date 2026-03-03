"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight, UserPlus, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import ForgotPasswordForm from "./forworgot";
import { registerWithEmailAction } from "../actions";
import { loginWithCredentialsAction } from "../login/actions";
import { initialLoginState } from "../login/state";
import { toast } from "sonner";

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="group h-11 w-full rounded-xl bg-slate-900 font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      type="submit"
      disabled={pending}
    >
      {pending ? "Ingresando..." : "Entrar al panel"}
      <ArrowRight className="ml-2 size-4 transition group-hover:translate-x-0.5" />
    </Button>
  );
}

export default function Login({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [openForgot, setOpenForgot] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, loginAction] = useFormState(
    loginWithCredentialsAction,
    initialLoginState
  );

  useEffect(() => {
    if (loginState.ok && loginState.redirect) {
      router.push(loginState.redirect);
    }
  }, [loginState.ok, loginState.redirect, router]);

  async function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingRegister(true);

    const formData = new FormData(event.currentTarget);

    try {
      const created = await registerWithEmailAction(formData);
      if (created) {
        toast.success("Te enviamos una contraseña temporal a tu correo.");
        setOpenRegister(false);
        router.push("/login");
      } else {
        toast.error("No se pudo completar el registro. Inténtalo nuevamente.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setIsSubmittingRegister(false);
    }
  }

  return (
    <>
      <div className="space-y-5">
        <form
          action={loginAction}
          className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/70"
        >
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />

          <div className="space-y-1.5">
            <label htmlFor="identifier" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Usuario o correo
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <Input
                id="identifier"
                name="identifier"
                placeholder="Usuario"
                required
                className="h-11 rounded-xl border-slate-300 bg-white pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contrasena" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Contraseña
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <Input
                id="contrasena"
                name="contrasena"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                required
                className="h-11 rounded-xl border-slate-300 bg-white pl-10 pr-10 text-slate-900 focus-visible:ring-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {loginState.message ? (
            <p className={`text-sm ${loginState.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
              {loginState.message}
            </p>
          ) : null}

          <LoginSubmitButton />
        </form>

        <Button
          className="h-11 w-full rounded-xl border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          type="button"
          onClick={() => window.location.assign("/api/auth/google/start")}
        >
          Continuar con Google
        </Button>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            className="h-11 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            variant="outline"
            type="button"
            onClick={() => setOpenRegister(true)}
          >
            <UserPlus className="mr-2 size-4" />
            Registrarme
          </Button>

          <Button
            className="h-11 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            variant="outline"
            type="button"
            onClick={() => setOpenForgot(true)}
          >
            <KeyRound className="mr-2 size-4" />
            Recuperar acceso
          </Button>
        </div>
      </div>

      <Dialog open={openRegister} onOpenChange={setOpenRegister}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registro con correo</DialogTitle>
            <DialogDescription>
              Ingresa tu correo para crear tu cuenta. Te enviaremos una contraseña temporal para que la cambies al ingresar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="register-email" className="text-sm font-medium">
                Correo
              </label>
              <Input
                id="register-email"
                name="email"
                type="email"
                placeholder="tu-correo@dominio.com"
                required
                className="w-full"
                disabled={isSubmittingRegister}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpenRegister(false)}
                disabled={isSubmittingRegister}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingRegister}>
                {isSubmittingRegister ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openForgot} onOpenChange={setOpenForgot}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Recuperar contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu usuario para recibir un correo con el enlace de restablecimiento.
            </DialogDescription>
          </DialogHeader>
          <ForgotPasswordForm
            onCancel={() => setOpenForgot(false)}
            onSuccess={() => {
              setOpenForgot(false);
              toast.success(
                "Te enviamos un correo con instrucciones para restablecer tu contraseña."
              );
              router.push("/login");
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
