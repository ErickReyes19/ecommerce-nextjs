# Portada "Pulpería moderna" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la portada estática por la dirección "Pulpería moderna" con datos reales de Prisma, y dar a toda la tienda pública la nueva paleta y tipografía.

**Architecture:** Tokens shadcn redefinidos bajo la clase `.tienda` (aplicada en `app/(public)/layout.tsx` junto con la fuente Archivo). La portada es un server component dinámico que llama a `getPortadaData()` (consultas en paralelo, vacío ante fallo) y compone secciones server; solo la etiqueta animada del hero es cliente (`motion`). Lógica pura (nombres de categoría, partes del precio, selección) va en módulos sin imports para probarla con `node --test`.

**Tech Stack:** Next.js 14.2 App Router, Tailwind 3.4, shadcn/Radix, `motion` 12 (`motion/react`), Prisma 6 (MySQL), `next/font/google`, Node 24 test runner (type stripping).

**Spec:** `docs/superpowers/specs/2026-11-17-portada-pulperia-moderna-design.md`

## Global Constraints

- Directorio de trabajo: `C:/dev/ecommerce-nextjs-portada` (rama `feat/portada-pulperia`). Nunca tocar `C:/dev/ecommerce-nextjs`.
- No tocar código de `app/(public)/checkout/**`, `lib/pixelpay*`, `app/(protected)/**`, `app/api/**`.
- No agregar dependencias. Pruebas: archivos `*.test.mts` junto al módulo, `node --test <archivos>`; los módulos probados no importan nada (salvo `import type`).
- Colores (claro / oscuro): Cal `#F7F8F5` / Noche `#0E1A2B`; Superficie `#FFFFFF` / `#15243A`; Tinta `#13233A` / `#EDF1EE`; Tinta suave `#566173` / `#9AA7B5`; Turquesa `#007C88` / `#3FC1CC`; Mango `#FFC233` (texto siempre `#13233A`); Guara `#C9321F` relleno con texto blanco (texto Guara sobre Noche: `#E5533F`).
- Tipografía: solo Archivo (ejes `wght`, `wdth`). Titulares ~70 % de ancho, peso 800, interlineado ~0.95; precios ~118 % de ancho, peso 800, `tabular-nums`; texto ancho normal.
- Copia: tuteo, sentence case, sin MAYÚSCULAS en etiquetas, sin eyebrows, sin palabra resaltada en titulares, sin promesas no verificables (envío gratis, devoluciones, 24/7, boletín).
- Titular exacto: "Lo de la casa, el cel y el clóset, con el precio a la vista."
- Movimiento: solo el vaivén de etiquetas del hero al cargar + "pop" del corazón al marcar; ambos desactivados con `prefers-reduced-motion`.
- Enlaces existentes se conservan: `/productos`, `/productos/[slug]`, `/productos?categoria=<slug>`, `/carrito`, `/lista-deseos`, `accountHref`.
- Commits pequeños en `feat/portada-pulperia` con trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Sin push.

## Review Focus

1. **Productos sin imagen válida** (60 imágenes son rutas relativas que `pickFirstValidImageUrl` rechaza): las tarjetas muestran un marcador; el hero nunca muestra un producto sin imagen. → prueba en Task 1 (`pickDistinctByCategory` omite `image: null`).
2. **Base de datos caída:** la portada responde 200 con titular, búsqueda y franja de confianza, sin secciones vacías ni error. → paso en Task 6 con `DATABASE_URL` inválido.
3. **Nombres largos a 375 px** ("Accesorios para celular", nombres de producto de 2+ líneas) no generan scroll horizontal. → paso en Task 7 (`scrollWidth <= innerWidth`).
4. **Precios extremos** (`L 1.00`, `L 15,999.99`) caben en la etiqueta dentro de una tarjeta de 2 columnas a 375 px. → prueba `splitHNL` en Task 1 + captura en Task 7.
5. **Menos datos de los que el diseño espera** (0 ofertas, <4 productos con imagen en categorías distintas, <10 categorías): las secciones se ocultan o se acomodan sin huecos. → prueba en Task 1 (devuelve menos de `count`) + secciones devuelven `null` con `[]`.

---

### Task 1: Lógica pura con pruebas

**Files:**
- Create: `src/lib/category-labels.ts`, `src/lib/category-labels.test.mts`
- Create: `src/lib/price.ts`, `src/lib/price.test.mts`
- Create: `src/lib/portada-select.ts`, `src/lib/portada-select.test.mts`

**Interfaces:**
- Produces:
  - `getCategoryLabel(category: { name: string; slug: string }): string`
  - `splitHNL(amount: number): { symbol: string; integer: string; fraction: string }`
  - `discountPercent(basePrice: number, compareAtPrice?: number | null): number | null`
  - `pickDistinctByCategory<T extends { image: string | null; category: { slug: string } }>(items: T[], count: number): T[]`
  - `onlyRealDeals<T extends { basePrice: number; compareAtPrice: number | null }>(items: T[]): T[]`

- [ ] **Step 1: Write the failing tests**

```ts
// category-labels.test.mts
assert.equal(getCategoryLabel({ name: "smartphones", slug: "smartphones" }), "Celulares");
assert.equal(getCategoryLabel({ name: "groceries", slug: "groceries" }), "Súper");
assert.equal(getCategoryLabel({ name: "kitchen-accessories", slug: "kitchen-accessories" }), "Accesorios de cocina");
assert.equal(getCategoryLabel({ name: "Electrónica", slug: "electronica" }), "Electrónica");
assert.equal(getCategoryLabel({ name: "pet-supplies", slug: "pet-supplies" }), "Pet supplies");
assert.equal(getCategoryLabel({ name: "Ropa Niños", slug: "ropa-ninos" }), "Ropa Niños");

// price.test.mts
assert.deepEqual(splitHNL(1299.5), { symbol: "L", integer: "1,299", fraction: "50" });
assert.deepEqual(splitHNL(1), { symbol: "L", integer: "1", fraction: "00" });
assert.deepEqual(splitHNL(15999.99), { symbol: "L", integer: "15,999", fraction: "99" });
assert.equal(discountPercent(75, 100), 25);
assert.equal(discountPercent(100, 100), null);
assert.equal(discountPercent(100, 90), null);
assert.equal(discountPercent(100, null), null);

// portada-select.test.mts
const p = (id, slug, image = "https://x/y.webp") => ({ id, image, category: { slug } });
assert.deepEqual(pickDistinctByCategory([p("a","x"), p("b","x"), p("c","y"), p("d","z", null), p("e","w")], 3).map(i => i.id), ["a","c","e"]);
assert.equal(pickDistinctByCategory([p("a","x"), p("b","x")], 4).length, 1);
assert.deepEqual(onlyRealDeals([{ basePrice: 75, compareAtPrice: 100 }, { basePrice: 100, compareAtPrice: 100 }, { basePrice: 10, compareAtPrice: null }]).length, 1);
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test src/lib/category-labels.test.mts src/lib/price.test.mts src/lib/portada-select.test.mts`
Expected: FAIL (módulos no existen).

- [ ] **Step 3: Implement the three modules**

`category-labels.ts`: mapa por slug con las 27 categorías actuales — beauty→Belleza, fragrances→Perfumes, furniture→Muebles, groceries→Súper, home-decoration→Decoración, kitchen-accessories→Accesorios de cocina, laptops→Laptops, mens-shirts→Camisas de hombre, mens-shoes→Zapatos de hombre, mens-watches→Relojes de hombre, mobile-accessories→Accesorios para celular, motorcycle→Motos, skin-care→Cuidado de la piel, smartphones→Celulares, sports-accessories→Deportes, sunglasses→Lentes de sol, tablets→Tablets, tops→Blusas y tops, vehicle→Vehículos, womens-bags→Bolsos, womens-dresses→Vestidos, womens-jewellery→Joyería, womens-shoes→Zapatos de mujer, womens-watches→Relojes de mujer. Sin entrada: si `name === slug` (o es `/^[a-z0-9-]+$/`) → guiones a espacios y primera letra mayúscula; si no, `name` tal cual.
`price.ts`: `Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL", minimumFractionDigits: 2 }).formatToParts`; `integer` une partes `integer` y `group`. `discountPercent` = `Math.round((c - b) / c * 100)` solo si `c > b`.

- [ ] **Step 4: Run tests to verify they pass** — mismo comando. Expected: `pass 3+`, `fail 0`.

- [ ] **Step 5: Commit** — `feat: utilidades de portada (nombres de categoría, precio, selección)`

---

### Task 2: Tema "tienda" y fuente Archivo

**Files:**
- Modify: `app/globals.css`, `tailwind.config.ts`, `app/(public)/layout.tsx`

**Interfaces:**
- Produces: clase `.tienda`; utilidades `font-condensed` (`font-stretch: 70%`) y `font-expanded` (`font-stretch: 118%`); colores Tailwind `mango` / `mango-foreground`, `guara` / `guara-foreground` / `guara-texto`, `vitrina`, `pie` / `pie-foreground`.

- [ ] **Step 1: Tokens en `globals.css`**
  - `:root` (global): `--mango: 42.1 100% 60%; --mango-foreground: 215.4 50.6% 15.1%; --guara: 6.7 73.3% 45.5%; --guara-foreground: 0 0% 100%; --guara-texto: 6.7 73.3% 45.5%;` y en `.dark`: `--guara-texto: 7.2 76.1% 57.3%`.
  - `.tienda` claro: background `80 17.6% 96.7%`; foreground/card-foreground/popover-foreground/secondary-foreground/accent-foreground `215.4 50.6% 15.1%`; card/popover `0 0% 100%`; primary `185.3 100% 26.7%` / primary-foreground `0 0% 100%`; secondary/muted `96 13.5% 92.7%`; muted-foreground `217.2 14.4% 39.4%`; accent `180 33.3% 91.2%`; destructive `6.7 73.3% 45.5%` / `0 0% 100%`; border/input `110 9.4% 87.5%`; ring `185.3 100% 26.7%`; radius `0.5rem`; `--vitrina: 96 15.2% 93.5%`; `--pie: 215.4 50.6% 15.1%`; `--pie-foreground: 135 12.5% 93.7%`.
  - `.dark .tienda`: background `215.2 50.9% 11.2%`; foreground (y *-foreground de card/popover/secondary/accent) `135 12.5% 93.7%`; card/popover `215.7 46.8% 15.5%`; primary `184.7 58% 52.4%` / primary-foreground `215.2 50.9% 11.2%`; secondary/muted `215.4 41.9% 18.2%`; muted-foreground `211.1 15.4% 65.7%`; accent `198.1 43.4% 19.4%`; destructive `6.7 73.3% 45.5%`; border/input `215.4 35.1% 21.8%`; ring `184.7 58% 52.4%`; `--vitrina: 214.8 37.3% 26.3%`; `--pie: 217.5 54.5% 8.6%`.
  - `.tienda { font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif; }` y `.tienda .font-serif, .tienda .font-sans { font-family: inherit; }`.
  - Utilidades `font-condensed`, `font-expanded` en `@layer utilities`; keyframes `heart-pop` (escala 1 → 1.3 → 1, 300 ms) envueltas en `@media (prefers-reduced-motion: no-preference)` como utilidad `animate-heart-pop`.
- [ ] **Step 2: `tailwind.config.ts`** — agregar colores listados en *Produces* como `hsl(var(--x))`.
- [ ] **Step 3: Layout** — `Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" })`; el `div` raíz recibe `` `${archivo.variable} tienda` `` además de sus clases actuales. Nada más cambia en el layout.
- [ ] **Step 4: Verificar** — preparar el worktree una vez: copiar `.env` desde `C:/dev/ecommerce-nextjs/.env`, `pnpm install`. Levantar `pnpm dev -p 3100`, abrir `/productos`: fondo Cal, botones turquesa, títulos en Archivo; en DevTools `getComputedStyle(h1).fontFamily` contiene `__Archivo`, y un elemento con `font-condensed` se ve más angosto (si no, el `@font-face` no declara el rango `font-stretch`: usar `font-variation-settings: "wdth" 70` como respaldo).
- [ ] **Step 5: Commit** — `feat: tema visual de la tienda (paleta Pulpería y Archivo)`

---

### Task 3: Etiqueta de precio y tarjeta de producto

**Files:**
- Create: `src/components/ecommerce/price-tag.tsx`
- Modify: `src/components/ecommerce/product-card.tsx`, `src/components/ecommerce/wishlist-button.tsx`

**Interfaces:**
- Consumes: `splitHNL`, `discountPercent`, `getCategoryLabel` (Task 1).
- Produces:
  - `PriceTag({ amount, size = "md", className }: { amount: number; size?: "sm" | "md" | "lg"; className?: string })` — server-safe (sin hooks).
  - `ProductCard({ product, priority? }: Props & { priority?: boolean })` — `Props` igual que hoy salvo `category: { name: string; slug?: string }` (el catálogo ya pasa el objeto Prisma con `slug`); la etiqueta usa `getCategoryLabel({ name, slug: slug ?? name })`.
  - `WishlistButton` acepta además `className?: string`.

- [ ] **Step 1: `PriceTag`** — forma: `clip-path: polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)` + agujero con `mask: radial-gradient(circle at 12px 50%, transparent 3px, #000 3.5px)`; fondo `bg-mango text-mango-foreground`; `L` pequeño, entero `font-expanded font-extrabold tabular-nums`, centavos pequeños y elevados (`align-top`). Precio completo en `sr-only` (`formatHNL`), la parte visual con `aria-hidden`. Tamaños: sm 16 px / md 20 px / lg 28 px del entero.
- [ ] **Step 2: `ProductCard`** — bandeja `bg-vitrina` `aspect-square`, imagen `object-contain p-[10%]` (marcador `ShoppingBag` si no hay imagen); sello `-{n} %` `bg-guara text-guara-foreground` arriba a la izquierda cuando `discountPercent` no es null; `WishlistButton` arriba a la derecha (`relative z-10`). Debajo: categoría con `getCategoryLabel` (texto `muted-foreground`, 13 px), nombre `line-clamp-2`, `PriceTag size="sm"` y precio anterior tachado. Patrón "stretched link": el `Link` del nombre con `after:absolute after:inset-0`; foco visible con `has-[a:focus-visible]:ring-2 ring-ring ring-offset-2 ring-offset-background`. Sin elevación en hover; solo el nombre cambia a `text-primary`. Imagen con `priority` cuando se pasa.
- [ ] **Step 3: `WishlistButton`** — agregar `className` (merge con `cn`), corazón marcado `fill-current text-guara-texto` y `animate-heart-pop` con `key` dependiente del estado para que se re-dispare.
- [ ] **Step 4: Verificar** — `/productos` en el dev server: tarjetas nuevas, catálogo con nombres en español, foco por teclado visible en cada tarjeta y en el corazón, la tarjeta del Rolex (`L 15,999.99`) no desborda a 375 px.
- [ ] **Step 5: Commit** — `feat: etiqueta de precio y nueva tarjeta de producto`

---

### Task 4: Datos de la portada

**Files:**
- Create: `app/(public)/portada-data.ts`

**Interfaces:**
- Consumes: `pickDistinctByCategory`, `onlyRealDeals` (Task 1), `pickFirstValidImageUrl`, `getWishlistProductIdsForCurrentUser`, `prisma`.
- Produces:
  ```ts
  export type PortadaProduct = { id: string; name: string; slug: string; basePrice: number; compareAtPrice: number | null;
    image: string | null; category: { name: string; slug: string }; initialIsInWishlist: boolean };
  export type PortadaCategory = { name: string; slug: string; productCount: number; image: string | null };
  export type PortadaData = { hero: PortadaProduct[]; categories: PortadaCategory[]; deals: PortadaProduct[];
    latest: PortadaProduct[]; totals: { products: number; categories: number } };
  export async function getPortadaData(): Promise<PortadaData>;
  ```

- [ ] **Step 1: Implementar** — módulo de servidor normal (sin `"use server"`). `Promise.all`: (a) categorías con productos activos, `_count` de activos, e `include products: { where: { active: true }, take: 1, orderBy: { rating: "desc" }, select: { images: { where: { isMain: true }, take: 1 } } }`; ordenar por cantidad desc y tomar 10; (b) 24 productos activos por `rating desc` → `pickDistinctByCategory(…, 4)` para `hero`; (c) 40 productos con `compareAtPrice: { not: null }` por `rating desc` → `onlyRealDeals` → 10; (d) 8 por `createdAt desc`; (e) `product.count({ where: { active: true } })`; (f) ids de deseos. Decimal → `Number`. Todo dentro de `try/catch` que hace `console.error` y devuelve el vacío `{ hero: [], categories: [], deals: [], latest: [], totals: { products: 0, categories: 0 } }`; los deseos fallan por separado a `[]`.
- [ ] **Step 2: Commit** — se verifica en Task 6 (no hay forma de probarlo sin Next por los alias `@/`). `feat: consultas de datos de la portada`

---

### Task 5: Secciones de la portada

**Files:**
- Create: `src/components/ecommerce/hanging-tag.tsx` (cliente)
- Modify: `hero-section.tsx`, `categories-grid.tsx`, `promo-section.tsx`, `featured-products.tsx`, `features-strip.tsx` (todos en `src/components/ecommerce/`)

**Interfaces:**
- Consumes: tipos de Task 4, `PriceTag`, `ProductCard`, `getCategoryLabel`.
- Produces:
  - `HangingTag({ index, children }: { index: number; children: ReactNode })` — `motion.div` con `transformOrigin: "12px 50%"`, rotación inicial `-14deg` → `0` con resorte (`stiffness 120, damping 8`), `delay: 0.25 + index * 0.12`; con `useReducedMotion()` renderiza estático.
  - `HeroSection({ products, categories, totals }: { products: PortadaProduct[]; categories: PortadaCategory[]; totals: PortadaData["totals"] })`
  - `CategoriesGrid({ categories }: { categories: PortadaCategory[] })`
  - `PromoSection({ products }: { products: PortadaProduct[] })`
  - `FeaturedProducts({ products }: { products: PortadaProduct[] })`
  - `FeaturesStrip()`

- [ ] **Step 1: `HeroSection`** — grid `lg:grid-cols-[1.1fr_1fr]`, alineado a la izquierda. Titular exacto (`h1`, `font-condensed font-extrabold`, 44 px móvil → 80 px desktop, `leading-[0.95]`, `text-balance`). Subtítulo: con totales > 0 "`{products} productos en {categories} categorías. Pagas en lempiras con tarjeta, de forma segura.`"; si no, solo la segunda frase. Búsqueda: `<form action="/productos" role="search">` con `label` sr-only "Buscar productos", `input name="q"` (`type="search"`, alto 52 px), botón primario "Buscar". Debajo, las 6 primeras categorías como enlaces-chip (`/productos?categoria=slug`) en una fila con `overflow-x-auto` propio. Columna derecha (solo si hay productos): mostrador 2×2 de tiles `bg-vitrina` con imagen `object-contain`, `alt={name}`, el primero `priority`; cada tile enlaza a `/productos/[slug]` y lleva `HangingTag` + `PriceTag size="lg"` colgando del borde inferior. Si `products` está vacío, la columna izquierda ocupa todo el ancho.
- [ ] **Step 2: `CategoriesGrid`** — `null` si vacío. `h2` "Pasillos" + enlace "Ver catálogo" a `/productos`. Móvil: carril `flex overflow-x-auto snap-x` con tiles `w-[44%] shrink-0 snap-start`; `md:grid md:grid-cols-5`. Tile: bandeja `bg-vitrina` con imagen de la categoría (`alt=""`, decorativa, porque el nombre va como texto), nombre con `getCategoryLabel` en `font-condensed font-bold` 22 px, "`{n} productos`" en `muted-foreground`.
- [ ] **Step 3: `PromoSection`** — `null` si vacío. `h2` "Ofertas", texto "Precios rebajados en este momento." Carril horizontal de `ProductCard` (`w-[46%] sm:w-[30%] lg:w-[19%]`) con `snap-x`. Sin enlace "ver todas" (no existe filtro).
- [ ] **Step 4: `FeaturedProducts`** — `null` si vacío. `h2` "Recién llegados" + "Ver catálogo". Grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`, gap 16/24 px.
- [ ] **Step 5: `FeaturesStrip`** — una franja con borde superior e inferior, 3 ítems en fila desde `md` separados por `divide-x`, apilados en móvil: (1) icono `CreditCard` "Pago con tarjeta a través de PixelPay" / "Tus datos de tarjeta los procesa PixelPay, no esta tienda."; (2) `Banknote` "Precios en lempiras" / "Lo que ves es lo que pagas, sin conversiones."; (3) `Heart` "Guarda tus favoritos" / enlace "Ver mi lista de deseos" a `/lista-deseos`.
- [ ] **Step 6: Commit** — `feat: secciones de la portada Pulpería moderna`

---

### Task 6: Componer la portada

**Files:**
- Modify: `app/(public)/page.tsx`

**Interfaces:**
- Consumes: `getPortadaData` (Task 4) y las secciones (Task 5).

- [ ] **Step 1: Implementar** — `export const dynamic = "force-dynamic"`; `metadata` con title "Tienda | Lo de la casa, el cel y el clóset" y description del subtítulo. Devuelve un fragmento (el layout ya pone `<main>`): Hero → Pasillos → Ofertas → Recién llegados → Franja. Espaciado vertical entre secciones 64 px móvil / 96 px desktop, contenedor `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`.
- [ ] **Step 2: Verificar con datos** — `pnpm dev -p 3100`, `/` responde 200, se ven las 5 secciones con productos reales; los enlaces de tiles, chips y tarjetas llevan a rutas existentes.
- [ ] **Step 3: Verificar sin base de datos** — segundo servidor con `DATABASE_URL="mysql://x:x@127.0.0.1:1/x" pnpm dev -p 3101`; `/` responde 200 y muestra titular, búsqueda y franja, sin pasillos/ofertas/recién llegados; no hay overlay de error.
- [ ] **Step 4: Commit** — `feat: nueva portada con datos reales`

---

### Task 7: Barra de navegación y pie

**Files:**
- Modify: `src/components/ecommerce/store-navbar.tsx`, `src/components/ecommerce/store-footer.tsx`

- [ ] **Step 1: Navbar** — marca: pequeña etiqueta mango (misma forma de `PriceTag`, 18×12 px, decorativa) + "Tienda" en `font-condensed font-extrabold` 26 px. Desde `lg`: formulario de búsqueda compacto (mismo `action="/productos"`, `name="q"`, label sr-only) en lugar del icono de lupa; en `md` se conserva el icono. Insignia del carrito `bg-mango text-mango-foreground`. `SheetContent` recibe `className="tienda …"`. Textos con tildes: "Categorías", "Abrir menú", "Menú de navegación"; en el menú móvil el enlace de cuenta dice "Mi cuenta". Mismos `href`.
- [ ] **Step 2: Footer** — `bg-pie text-pie-foreground`, texto secundario con `opacity-75`, enlaces con subrayado al foco/hover; marca igual que la barra. Descripción: "Tienda en línea hondureña. Precios en lempiras y pago con tarjeta a través de PixelPay." Tildes: "Categorías", "Iniciar sesión", "Términos". Mismos `href`.
- [ ] **Step 3: Verificar** — navegación por teclado completa en la barra (desktop y menú móvil) con foco visible sobre fondo Cal y Noche.
- [ ] **Step 4: Commit** — `feat: barra y pie con la identidad Pulpería`

---

### Task 8: Verificación final

- [ ] **Step 1: Pruebas** — `node --test src/lib/*.test.mts` → `fail 0`.
- [ ] **Step 2: Build** — `pnpm run build` → termina sin error; `/` aparece como `ƒ (Dynamic)`.
- [ ] **Step 3: Capturas** — en el navegador integrado, `/` a 1440 px y a 375 px, en claro y en oscuro (4 capturas), más `/productos` a 375 px. Revisar contra el diseño y corregir lo que se vea mal (una iteración de autocrítica: "quitar un accesorio").
- [ ] **Step 4: Sin scroll horizontal** — a 375 px: `document.documentElement.scrollWidth <= window.innerWidth` es `true` en `/` y `/productos`.
- [ ] **Step 5: Accesibilidad** — recorrer con Tab: foco visible en búsqueda, chips, tiles, tarjetas, corazones, barra y pie. Toda `img` de producto tiene `alt` con el nombre (las de pasillos `alt=""`). Con `prefers-reduced-motion: reduce` (emulado) las etiquetas no se mueven.
- [ ] **Step 6: Commit final** de ajustes de la autocrítica, si los hubo. Sin push.
