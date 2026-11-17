# Portada "Pulpería moderna": diseño

Fecha: 2026-11-17 · Rama: `feat/portada-pulperia` (desde `main` @ `ec40611`)

## Intención

La portada actual (`app/(public)/page.tsx`) se ve genérica: es una landing fija de "marketplace" que no muestra
ningún producto real. Además, la base visual de la tienda (fondo crema, títulos en Playfair, acento casi negro)
es el aspecto típico de las páginas generadas por IA. Queremos una identidad propia y memorable, con raíz
hondureña, que lleve a la persona a un producto en uno o dos toques y con el precio a la vista desde el inicio.

- **Qué es:** tienda en línea hondureña, multicategoría, precios en lempiras (HNL), pago con PixelPay.
- **Para quién (propuesta aceptada):** compradores en Honduras, mayormente desde el celular, que comparan precios
  y todavía desconfían un poco de comprar en línea.
- **Trabajo principal de la portada:** buscar o entrar a una categoría/producto rápido, viendo precios reales.

## Objetivos

1. Dirección visual "Pulpería moderna": la energía del rótulo de pulpería y del mercado (precios grandes, todo a la
   vista) en una cuadrícula limpia y contemporánea.
2. Mostrar datos reales de Prisma: productos, ofertas y categorías.
3. Móvil primero, sin scroll horizontal de la página; claro y oscuro (`next-themes`).
4. Accesible: contraste AA, foco visible, textos alternativos, `prefers-reduced-motion` respetado.
5. `pnpm run build` pasa; verificación con capturas en desktop y móvil, claro y oscuro.

## No objetivos

- No se toca el código de checkout, PixelPay, ni el panel admin.
- No se agregan filtros nuevos a `/productos` (por ejemplo "solo ofertas" o "varias categorías").
- No se cambia el nombre de la marca ("Tienda" sigue como provisional).
- No se agrega "agregar al carrito" rápido en las tarjetas (hay productos con variantes que requieren elegir).

## Anti-objetivos (sería un fracaso aunque funcione)

- Que se vea como otra plantilla: tarjetas idénticas con la misma sombra, etiquetas en MAYÚSCULAS sobre cada
  título, animaciones de "aparecer al hacer scroll" en cada sección.
- Que caiga en lo folclórico o kitsch (banderitas, texturas de madera, tipografías "pintadas" falsas).
- Que la portada se rompa o quede en blanco si la base de datos no responde.
- Promesas que no sabemos si son ciertas (envío gratis, devoluciones en 30 días, soporte 24/7, descuentos de boletín).

## Enfoques considerados

| Enfoque | Qué ofrece | Costo | Decisión |
|---|---|---|---|
| **A. Pulpería moderna** | Precios protagonistas, energía de mercado, una sola familia tipográfica que juega con su ancho | Riesgo de verse "barato" si se exagera; se controla con mucho espacio y una sola pieza audaz | **Elegido por el usuario** |
| B. Fachadas de colores | Cada pasillo un bloque de color (Gracias, Copán Ruinas), más exploratorio | Muchos colores difíciles de sostener con buen contraste en oscuro; invita menos a comparar precios | Descartado |
| C. Pulir lo actual | Coherencia inmediata con el resto de páginas | No resuelve que se vea genérica | Descartado |

## Sistema visual

### Color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| Cal | `#F7F8F5` | Noche `#0E1A2B` | Fondo |
| Superficie | `#FFFFFF` | `#15243A` | Tarjetas, menús |
| Tinta | `#13233A` | `#EDF1EE` | Texto principal |
| Tinta suave | `#566173` | `#9AA7B5` | Texto secundario |
| Turquesa | `#007C88` | `#3FC1CC` | Botones, enlaces, foco |
| Mango | `#FFC233` | `#FFC233` | Etiqueta de precio (texto en Tinta `#13233A` siempre) |
| Guara | `#C9321F` | `#C9321F` relleno / `#E5533F` como texto | Descuentos |

Contrastes medidos: Tinta/Cal 14.8; Tinta suave/Cal 5.9; blanco/Turquesa 4.95; Tinta/Mango 9.8; blanco/Guara 5.3;
texto oscuro/Noche 15.3; Tinta suave oscura/Noche 7.1; Noche sobre Turquesa claro 8.1; Guara texto/Noche 4.7.

Los tokens se aplican como **variables de shadcn redefinidas bajo una clase `.tienda`** (y `.dark .tienda`) en
`app/globals.css`, más tokens propios `--mango`, `--guara`. La clase va en el contenedor de
`app/(public)/layout.tsx`, así **toda la tienda pública** (productos, carrito, checkout) hereda colores y letra sin
tocar su código, y el admin queda igual. Los portales de Radix (menú móvil `Sheet`) reciben la clase explícitamente.

### Tipografía

**Archivo** (Omnibus-Type, Argentina), variable con ejes de peso (100–900) y ancho (62–125), cargada con
`next/font/google` en el layout público. Una sola familia usada de forma activa:

- Titulares: ancho condensado (~70 %), peso 800, interlineado apretado (~0.95), tracking levemente negativo.
- Precios: ancho expandido (~115–125 %), peso 800, cifras tabulares; la parte decimal más pequeña y elevada,
  como en una etiqueta de precio real.
- Texto: ancho normal, peso 400–500, 16 px base, interlineado 1.5, líneas de menos de 75 caracteres.
- Escala (móvil → desktop): 14 · 16 · 20 · 28 · 40 → 64/80 en el titular principal.
- Sin MAYÚSCULAS en etiquetas, sin palabras resaltadas dentro de un titular, sin "eyebrows" sobre cada título.

Los títulos `font-serif` existentes en otras páginas de la tienda pasan a usar Archivo dentro de `.tienda`.

### La pieza memorable

La **etiqueta de precio**: forma de etiqueta real (rectángulo con una muesca circular a la izquierda, como el
agujero del hilo), color Mango, texto Tinta, precio en Archivo expandido. Se usa en el mostrador de la portada y en
todas las tarjetas de producto. Con descuento, aparece un sello Guara con el porcentaje y el precio anterior tachado.
Todo lo demás es sobrio: superficies planas, bordes finos, un único radio pequeño para tarjetas.

### Movimiento

- **Un solo momento orquestado:** al cargar la portada, las etiquetas del mostrador "cuelgan" con un leve vaivén
  (rotación que se asienta), escalonadas. Con `prefers-reduced-motion` aparecen sin movimiento.
- Respuestas a la acción de la persona: el corazón de deseos hace un "pop" al marcar; foco y hover con cambios de
  color, sin elevar cada tarjeta.
- Librería `motion` (ya instalada), solo en componentes cliente pequeños.

## Estructura de la portada

```
DESKTOP
┌─────────────────────────────────────────────────────────────┐
│ Tienda   Inicio Productos Categorías   [Buscar…]   ☾ ♡ 👤 🛒 │
├────────────────────────────┬────────────────────────────────┤
│ Lo de la casa, el cel      │  ┌──────┐  ┌──────┐            │
│ y el clóset, con el        │  │ foto │  │ foto │            │
│ precio a la vista.         │  └◖L 799┘  └◖L 1,299┘          │
│ 224 productos en 27 categ. │  ┌──────┐  ┌──────┐            │
│ [ Buscar productos…   ][→] │  │ foto │  │ foto │            │
│ Celulares Cocina Belleza … │  └◖L 349┘  └◖L 6,499┘          │
├────────────────────────────┴────────────────────────────────┤
│ Pasillos                                    Ver catálogo    │
│ [foto Cocina 36] [foto Celulares 22] [foto Súper 27] … (2×5)│
├─────────────────────────────────────────────────────────────┤
│ Ofertas                                                     │
│ tarjetas con sello −25 % y precio anterior tachado (fila)   │
├─────────────────────────────────────────────────────────────┤
│ Recién llegados                              Ver catálogo   │
│ cuadrícula 4 × 2                                            │
├─────────────────────────────────────────────────────────────┤
│ Pago con tarjeta vía PixelPay | Precios en lempiras | ♡ …   │
├─────────────────────────────────────────────────────────────┤
│ Pie en Tinta (azul noche) con columnas de enlaces           │
└─────────────────────────────────────────────────────────────┘

MÓVIL (375 px)
┌───────────────────────┐
│ Tienda        ♡ 🛒 ☰  │
│ Lo de la casa, el cel │
│ y el clóset, con el   │
│ precio a la vista.    │
│ [Buscar productos…][→]│
│ Celulares Cocina …  → │  (fila con scroll propio)
│ ┌────┐┌────┐          │
│ │foto││foto│  2×2     │
│ └◖L ┘└◖L ┘           │
│ Pasillos  → (carril)  │
│ Ofertas   → (carril)  │
│ Recién llegados 2×4   │
│ Franja de confianza   │
└───────────────────────┘
```

- Alineación a la izquierda en todo (nada centrado salvo estados vacíos). Contenedor `max-w-7xl`, gutter 16 px
  en móvil y 24–32 px en desktop.
- Los carriles horizontales usan `overflow-x-auto` con `scroll-snap` **dentro** de su sección; la página nunca
  scrollea horizontalmente.

## Datos

Una función de servidor (`getPortadaData`) hace las consultas en paralelo y devuelve listas vacías si falla:

- **Mostrador:** 4 productos activos con imagen, de categorías distintas, priorizando los mejor calificados.
- **Pasillos:** categorías con productos activos, ordenadas por cantidad, las 10 primeras, cada una con la imagen
  principal de uno de sus productos como foto. Enlace: `/productos?categoria=<slug>`.
- **Ofertas:** productos con `compareAtPrice > basePrice` (hasta 10).
- **Recién llegados:** 8 productos más recientes.
- **Totales:** número de productos y categorías activos para el subtítulo.
- **Deseos:** ids de la lista del usuario (`getWishlistProductIdsForCurrentUser`).

Nombres de categoría: mapa `slug → nombre en español` en `src/lib/category-labels.ts`
(ej. `smartphones → Celulares`, `groceries → Súper`, `kitchen-accessories → Accesorios de cocina`); si no hay
entrada y el nombre parece un slug, se convierte a texto legible; si el nombre ya es humano, se usa tal cual.
`ProductCard` también lo usa, así el catálogo muestra nombres en español.

**Sin base de datos:** la página es dinámica (`export const dynamic = "force-dynamic"`; el layout ya lee cookies),
y si la consulta falla se muestra el hero con búsqueda y la franja de confianza, sin secciones vacías.

## Archivos

| Archivo | Cambio |
|---|---|
| `app/(public)/page.tsx` | Nueva composición; consulta datos |
| `app/(public)/portada-data.ts` | Nuevo: consultas de la portada con manejo de errores |
| `app/(public)/layout.tsx` | Carga Archivo y aplica la clase `.tienda` (solo eso) |
| `app/globals.css` | Tokens `.tienda` claro/oscuro y utilidades de ancho tipográfico |
| `tailwind.config.ts` | Colores `mango`, `guara`; familia `display` |
| `src/components/ecommerce/hero-section.tsx` | Mostrador con búsqueda y etiquetas animadas |
| `src/components/ecommerce/categories-grid.tsx` | Pasillos |
| `src/components/ecommerce/promo-section.tsx` | Ofertas (reemplaza la promo de boletín) |
| `src/components/ecommerce/featured-products.tsx` | Recién llegados |
| `src/components/ecommerce/features-strip.tsx` | Franja de confianza |
| `src/components/ecommerce/product-card.tsx` | Nueva tarjeta con etiqueta de precio (mismas props) |
| `src/components/ecommerce/price-tag.tsx` | Nuevo: etiqueta de precio |
| `src/lib/category-labels.ts` | Nuevo: nombres de categoría en español |
| `src/components/ecommerce/store-navbar.tsx` | Marca en Archivo, búsqueda en desktop, coherencia de color |
| `src/components/ecommerce/store-footer.tsx` | Pie en Tinta; enlaces existentes |

## Textos (propuesta)

- Titular: "Lo de la casa, el cel y el clóset, con el precio a la vista."
- Subtítulo: "{N} productos en {M} categorías. Pagas en lempiras con tarjeta, de forma segura."
- Franja de confianza (solo hechos verificables): pago con tarjeta a través de PixelPay; precios en lempiras;
  guarda tus favoritos en tu lista de deseos.
- Tuteo, como el resto del sitio. Frases cortas, verbos claros ("Buscar", "Ver catálogo").

## Decisiones del constructor (tomadas por mí, corregibles)

- Superficie de las fotos en oscuro: las fotos de dummyjson son recortes con transparencia; en oscuro van sobre
  una superficie azul más clara con un halo suave para que productos negros no desaparezcan. Se ajusta con capturas.
- Enlace "Categorías" del menú se mantiene (`/productos?vista=categorias`) aunque hoy `/productos` ignora `vista`.
- El pie conserva sus enlaces actuales; los de "Ayuda" que apuntan a `#` siguen así (no hay páginas todavía).

## Seguimiento posible (fuera de esta tarea)

- Filtro "ofertas" en `/productos` para enlazar "Ver todas las ofertas".
- Usar los nombres en español también en los filtros del catálogo.
- Nombre y logo reales de la marca.
