import { prisma } from "@/lib/prisma";

type DispatchItem = {
  orderItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
    sku: string;
    externalProductId: string | null;
  };
};

function buildHeaders(service: {
  authType: string;
  token: string | null;
  apiKey: string | null;
  secretKey: string | null;
  headersJson: string | null;
}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (service.authType.toUpperCase() === "BEARER" && service.token) headers.Authorization = `Bearer ${service.token}`;
  if (service.authType.toUpperCase() === "API_KEY" && service.apiKey) headers["x-api-key"] = service.apiKey;
  if (service.authType.toUpperCase() === "API_KEY_SECRET" && service.apiKey) {
    headers["x-api-key"] = service.apiKey;
    if (service.secretKey) headers["x-api-secret"] = service.secretKey;
  }

  if (service.headersJson) {
    try {
      const extra = JSON.parse(service.headersJson) as Record<string, string>;
      Object.assign(headers, extra);
    } catch {
      // Ignore invalid JSON, admin can correct it in provider config.
    }
  }

  return headers;
}

export async function dispatchOrderToProviders(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      address: true,
      items: {
        include: {
          product: {
            include: {
              provider: true,
              providerService: true,
            },
          },
        },
      },
    },
  });

  if (!order) return;

  const grouped = new Map<string, { service: NonNullable<typeof order.items[number]["product"]["providerService"]>; items: DispatchItem[] }>();

  for (const item of order.items) {
    const service = item.product.providerService;
    if (!service || !item.product.providerId) continue;

    const entry = grouped.get(service.id);
    const normalized: DispatchItem = {
      orderItemId: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      product: {
        id: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        externalProductId: item.product.externalProductId,
      },
    };

    if (entry) entry.items.push(normalized);
    else grouped.set(service.id, { service, items: [normalized] });
  }

  for (const [, group] of grouped) {
    const payload = {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        notes: order.notes,
        totals: {
          subtotal: Number(order.subtotal),
          shipping: Number(order.shippingTotal),
          tax: Number(order.taxTotal),
          grandTotal: Number(order.grandTotal),
        },
      },
      customer: {
        id: order.user?.id,
        name: order.user?.name,
        email: order.user?.email,
        address: order.address,
      },
      items: group.items,
    };

    const dispatch = await prisma.providerOrderDispatch.create({
      data: {
        orderId: order.id,
        providerServiceId: group.service.id,
        requestPayload: JSON.stringify(payload),
        status: "PENDING",
      },
    });

    try {
      const response = await fetch(`${group.service.baseUrl}${group.service.orderEndpoint}`, {
        method: "POST",
        headers: buildHeaders(group.service),
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      await prisma.providerOrderDispatch.update({
        where: { id: dispatch.id },
        data: {
          status: response.ok ? "SENT" : "FAILED",
          responsePayload: text,
          errorMessage: response.ok ? null : `HTTP ${response.status}`,
        },
      });
    } catch (error) {
      await prisma.providerOrderDispatch.update({
        where: { id: dispatch.id },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Error no controlado",
        },
      });
    }
  }
}
