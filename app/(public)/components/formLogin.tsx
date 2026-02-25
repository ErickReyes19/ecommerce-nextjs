"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import ForgotPasswordForm from "./forworgot";
import { registerWithEmailAction } from "../actions";
import { loginWithCredentialsAction } from "../login/actions";
import { initialLoginState } from "../login/state";
import { toast } from "sonner";

function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? "Ingresando..." : "Ingresar"}
    </Button>
  );
}

export default function Login() {
  const router = useRouter();
  const [openForgot, setOpenForgot] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);
  const [loginState, loginAction] = useFormState(loginWithCredentialsAction, initialLoginState);

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
      <div className="space-y-4">
        <form action={loginAction} className="space-y-3 rounded-md border p-4">
          <div className="space-y-1">
            <label htmlFor="identifier" className="text-sm font-medium">
              Usuario o correo
            </label>
            <Input
              id="identifier"
              name="identifier"
              placeholder="tu_usuario o tu-correo@dominio.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="contrasena" className="text-sm font-medium">
              Contraseña
            </label>
            <Input id="contrasena" name="contrasena" type="password" required />
          </div>

          {loginState.message ? (
            <p className={`text-sm ${loginState.ok ? "text-green-600" : "text-destructive"}`}>
              {loginState.message}
            </p>
          ) : null}

          <LoginSubmitButton />
        </form>


        <Button className="w-full" type="button" onClick={() => window.location.assign("/api/auth/google/start")}>
          Continuar con Google
        </Button>

        <Button className="w-full" variant="outline" type="button" onClick={() => setOpenRegister(true)}>
          Registrarme con correo
        </Button>

        <Button className="w-full" variant="link" type="button" onClick={() => setOpenForgot(true)}>
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

          <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-4">
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
              <Button variant="outline" type="button" onClick={() => setOpenRegister(false)} disabled={isSubmittingRegister}>
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
              toast.success("Te enviamos un correo con instrucciones para restablecer tu contraseña.");
              router.push("/login");
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
