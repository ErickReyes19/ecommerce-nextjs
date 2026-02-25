"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("orden", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form>
      <select
        name="orden"
        value={current}
        onChange={(event) => onSortChange(event.target.value)}
        className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
      >
        <option value="reciente">Mas recientes</option>
        <option value="precio-asc">Precio: menor a mayor</option>
        <option value="precio-desc">Precio: mayor a menor</option>
        <option value="nombre">Nombre A-Z</option>
      </select>
    </form>
  );
}
