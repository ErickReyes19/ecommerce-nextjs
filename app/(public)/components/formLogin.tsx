"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

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
      className="h-11 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 font-semibold text-white transition hover:brightness-110"
      type="submit"
      disabled={pending}
    >
      {pending ? "Ingresando..." : "Ingresar"}
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
          className="space-y-4 rounded-2xl border border-white/15 bg-slate-900/40 p-5"
        >
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />

          <div className="space-y-1.5">
            <label htmlFor="identifier" className="text-sm font-medium text-slate-200">
              Usuario o correo
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="identifier"
                name="identifier"
                placeholder="tu_usuario o tu-correo@dominio.com"
                required
                className="h-11 border-white/15 bg-slate-950/70 pl-10 text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contrasena" className="text-sm font-medium text-slate-200">
              Contraseña
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="contrasena"
                name="contrasena"
                type={showPassword ? "text" : "password"}
                required
                className="h-11 border-white/15 bg-slate-950/70 pl-10 pr-10 text-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {loginState.message ? (
            <p className={`text-sm ${loginState.ok ? "text-emerald-400" : "text-rose-400"}`}>
              {loginState.message}
            </p>
          ) : null}

          <LoginSubmitButton />
        </form>

        <Button
          className="h-11 w-full border border-white/15 bg-white text-slate-900 hover:bg-slate-100"
          type="button"
          onClick={() => window.location.assign("/api/auth/google/start")}
        >
          Continuar con Google
        </Button>

        <Button
          className="h-11 w-full border-white/20 text-slate-100 hover:bg-white/10"
          variant="outline"
          type="button"
          onClick={() => setOpenRegister(true)}
        >
          Registrarme con correo
        </Button>

        <Button
          className="w-full text-slate-300 hover:text-white"
          variant="link"
          type="button"
          onClick={() => setOpenForgot(true)}
        >
          ¿Olvidaste tu contraseña?
        </Button>
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
