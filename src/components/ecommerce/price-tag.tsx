import { cn } from "@/lib/utils";
import { formatHNL } from "@/src/lib/currency";
import { splitHNL } from "@/src/lib/price";

const SIZES = {
  sm: "text-[17px]",
  md: "text-[22px]",
  lg: "text-[30px]",
} as const;

/**
 * Etiqueta de precio con forma de etiqueta real (punta y agujero a la izquierda).
 * El tamaño de la fuente del contenedor fija el tamaño de todo lo demás (unidades em).
 */
export function PriceTag({
  amount,
  size = "md",
  className,
}: {
  amount: number;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { symbol, integer, fraction } = splitHNL(amount);

  return (
    <span
      className={cn(
        "price-tag inline-flex items-start bg-mango leading-none text-mango-foreground",
        SIZES[size],
        className,
      )}
    >
      <span className="sr-only">{formatHNL(amount)}</span>
      <span aria-hidden="true" className="inline-flex items-start py-[0.22em] pl-[1.05em] pr-[0.4em]">
        <span className="mr-[0.12em] mt-[0.12em] text-[0.55em] font-bold">{symbol}</span>
        <span className="font-expanded font-extrabold tabular-nums tracking-tight">{integer}</span>
        <span className="ml-[0.06em] mt-[0.08em] text-[0.5em] font-bold tabular-nums">{fraction}</span>
      </span>
    </span>
  );
}
