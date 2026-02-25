"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MiPerfilActionState, changeMiPerfilPassword, updateMiPerfil } from "../actions";

const initialState: MiPerfilActionState = {
  ok: false,
  message: "",
};

function SubmitButton({ label = "Guardar cambios" }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : label}
    </Button>
  );
}

export function PerfilContactoForm({
  direccion,
  ciudad,
  telefono,
}: {
  direccion?: string | null;
  ciudad?: string | null;
  telefono?: string | null;
}) {
  const [profileState, profileAction] = useFormState(updateMiPerfil, initialState);
  const [passwordState, passwordAction] = useFormState(changeMiPerfilPassword, initialState);

  useEffect(() => {
    if (profileState.message) {
      if (profileState.ok) toast.success(profileState.message);
      else toast.error(profileState.message);
    }

    if (passwordState.message) {
      if (passwordState.ok) toast.success(passwordState.message);
      else toast.error(passwordState.message);
    }
  }, [profileState, passwordState]);

  return (
    <div className="space-y-4">
      <form action={profileAction} className="space-y-4 rounded-lg border p-4">
        <p className="font-medium">Datos de facturación/contacto</p>

        <div className="space-y-2">
          <Label htmlFor="direccion">Dirección</Label>
          <Input id="direccion" name="direccion" defaultValue={direccion ?? ""} placeholder="Colonia, calle, número" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input id="ciudad" name="ciudad" defaultValue={ciudad ?? ""} placeholder="San Pedro Sula" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" name="telefono" defaultValue={telefono ?? ""} placeholder="+504 ..." />
          </div>
        </div>

        <SubmitButton label="Guardar perfil" />
      </form>

      <form action={passwordAction} className="space-y-4 rounded-lg border p-4">
        <p className="font-medium">Cambiar contraseña</p>

        <div className="space-y-2">
          <Label htmlFor="actual">Contraseña actual</Label>
          <Input id="actual" name="actual" type="password" required placeholder="••••••••" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nueva">Nueva contraseña</Label>
          <Input id="nueva" name="nueva" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" />
        </div>

        <SubmitButton label="Actualizar contraseña" />
      </form>
    </div>
  );
}
