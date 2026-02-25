export function getOrderStatusLabel(status: string) {
  if (status === "CANCELADO") return "FINALIZADO";
  return status;
}
