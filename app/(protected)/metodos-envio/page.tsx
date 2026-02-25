import Link from "next/link";
import HeaderComponent from "@/components/HeaderComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { deleteMetodoEnvio, getMetodosEnvio } from "./actions";

export default async function MetodosEnvioPage() {
  const methods = await getMetodosEnvio();

  return (
    <div className="space-y-4">
      <HeaderComponent Icon={Truck} description="Configura métodos y costos de envío" screenName="Métodos de envío" />
      <div className="flex justify-end">
        <Button asChild><Link href="/metodos-envio/create">Nuevo método</Link></Button>
      </div>
      <main className="grid gap-3 md:grid-cols-2">
        {methods.map((method) => (
          <Card key={method.id}>
            <CardHeader><CardTitle className="text-base">{method.name}</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Zona: {method.zone.name}</p>
              <p>Tipo: {method.type}</p>
              <p>Precio: L {Number(method.price).toFixed(2)}</p>
              <p>Estado: {method.active ? "Activo" : "Inactivo"}</p>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline"><Link href={`/metodos-envio/${method.id}/edit`}>Editar</Link></Button>
                <form action={deleteMetodoEnvio.bind(null, method.id)}>
                  <Button size="sm" variant="destructive" type="submit">Eliminar</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
