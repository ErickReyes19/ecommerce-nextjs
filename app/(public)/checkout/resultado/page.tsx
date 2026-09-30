"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LOCAL_CART_KEY, writeLocalCart } from "@/src/lib/local-cart";
import { moneyFormatter } from "../components/pixelpay.utils";

type PaymentState = {
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "TIMEOUT";
  orderId?: string;
  orderNumber?: string;
  grandTotal?: number;
};

const MAX_TRIES = 10;
const POLL_INTERVAL_MS = 3000;

function Resultado() {
  const paymentId = useSearchParams().get("paymentId");
  const [state, setState] = useState<PaymentState>({ status: "PENDING" });

  useEffect(() => {
    if (!paymentId) {
      setState({ status: "FAILED" });
      return;
    }

    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const tick = async () => {
      const response = await fetch(`/api/pixelpay/hosted/status?paymentId=${encodeURIComponent(paymentId)}`, {
        cache: "no-store",
      })
        .then((res) => res.json())
        .catch(() => null);
      if (cancelled) return;

      if (response?.ok) setState(response);

      if (response?.status === "PAID") {
        writeLocalCart({ items: [], updatedAt: new Date().toISOString() });
        window.localStorage.removeItem(LOCAL_CART_KEY);
        return;
      }

      if (!response?.ok || response.status === "PENDING") {
        if (++tries < MAX_TRIES) {
          timer = setTimeout(tick, POLL_INTERVAL_MS);
        } else {
          setState((prev) => ({ ...prev, status: "TIMEOUT" }));
        }
      }
    };

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [paymentId]);

  if (state.status === "PAID") {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
        <h1 className="text-2xl font-bold">¡Pago aprobado!</h1>
        <p className="text-muted-foreground">
          Tu pedido <span className="font-medium text-foreground">{state.orderNumber}</span> fue confirmado
          {typeof state.grandTotal === "number" ? ` por ${moneyFormatter("HNL", state.grandTotal)}` : ""}.
        </p>
        <Button asChild>
          <Link href={`/perfil?orderId=${state.orderId ?? ""}`}>Ver mi pedido</Link>
        </Button>
      </div>
    );
  }

  if (state.status === "FAILED" || state.status === "REFUNDED") {
    return (
      <div className="space-y-4 text-center">
        <XCircle className="mx-auto h-14 w-14 text-destructive" />
        <h1 className="text-2xl font-bold">El pago no se completó</h1>
        <p className="text-muted-foreground">No se realizó ningún cargo. Tu carrito sigue disponible.</p>
        <Button asChild>
          <Link href="/carrito">Volver al carrito</Link>
        </Button>
      </div>
    );
  }

  if (state.status === "TIMEOUT") {
    return (
      <div className="space-y-4 text-center">
        <Loader2 className="mx-auto h-14 w-14 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Estamos confirmando tu pago</h1>
        <p className="text-muted-foreground">
          PixelPay aún no nos confirma el resultado. Revisa el estado de tu pedido en tu perfil en unos minutos.
        </p>
        <Button asChild variant="outline">
          <Link href="/perfil">Ir a mi perfil</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <Loader2 className="mx-auto h-14 w-14 animate-spin text-muted-foreground" />
      <h1 className="text-2xl font-bold">Confirmando tu pago…</h1>
      <p className="text-muted-foreground">No cierres esta página.</p>
    </div>
  );
}

export default function CheckoutResultadoPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-10">
          <Suspense>
            <Resultado />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
