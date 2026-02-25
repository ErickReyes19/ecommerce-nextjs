"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal, X } from "lucide-react";

type CategoryOption = { slug: string; name: string; count: number };
type BrandOption = { slug: string; name: string; count: number };

export function ProductFilters({
  categories,
  brands,
}: {
  categories: CategoryOption[];
  brands: BrandOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const activeCategory = searchParams.get("categoria") ?? "";
  const activeBrand = searchParams.get("marca") ?? "";
  const minPrice = searchParams.get("min") ?? "";
  const maxPrice = searchParams.get("max") ?? "";
  const query = searchParams.get("q") ?? "";

  const activeFilterCount = [activeCategory, activeBrand, minPrice, maxPrice, query].filter(Boolean).length;

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/productos?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/productos");
  }, [router]);

  const filtersContent = (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Buscar
        </Label>
        <Input
          placeholder="Nombre del producto..."
          defaultValue={query}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilter("q", (e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>

      <Separator />

      {/* Categories */}
      <Accordion type="single" collapsible defaultValue="categorias">
        <AccordionItem value="categorias" className="border-none">
          <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline">
            Categorias
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1 pt-1">
              <button
                onClick={() => updateFilter("categoria", "")}
                className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  !activeCategory
                    ? "bg-foreground text-background font-medium"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => updateFilter("categoria", cat.slug)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-foreground text-background font-medium"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {cat.name}
                  <span className="text-xs opacity-60">{cat.count}</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Brands */}
      {brands.length > 0 && (
        <>
          <Accordion type="single" collapsible defaultValue="marcas">
            <AccordionItem value="marcas" className="border-none">
              <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline">
                Marcas
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    onClick={() => updateFilter("marca", "")}
                    className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      !activeBrand
                        ? "bg-foreground text-background font-medium"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    Todas
                  </button>
                  {brands.map((brand) => (
                    <button
                      key={brand.slug}
                      onClick={() => updateFilter("marca", brand.slug)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        activeBrand === brand.slug
                          ? "bg-foreground text-background font-medium"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {brand.name}
                      <span className="text-xs opacity-60">{brand.count}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Separator />
        </>
      )}

      {/* Price range */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Rango de precio
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            className="h-9"
            onBlur={(e) => updateFilter("min", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                updateFilter("min", (e.target as HTMLInputElement).value);
            }}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            className="h-9"
            onBlur={(e) => updateFilter("max", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                updateFilter("max", (e.target as HTMLInputElement).value);
            }}
          />
        </div>
      </div>

      {activeFilterCount > 0 && (
        <>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={clearAll}
          >
            <X className="mr-2 h-3 w-3" />
            Limpiar filtros
          </Button>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24">{filtersContent}</div>
      </aside>

      {/* Mobile filter sheet */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetTitle className="mb-6 text-lg font-semibold">
              Filtros
            </SheetTitle>
            {filtersContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
