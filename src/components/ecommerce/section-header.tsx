import Link from "next/link";

/** Encabezado común de las secciones de la portada: título, texto opcional y enlace opcional. */
export function SectionHeader({
  id,
  title,
  description,
  href,
  linkLabel,
}: {
  id: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        <h2 id={id} className="font-condensed text-[34px] font-extrabold leading-none sm:text-[44px]">
          {title}
        </h2>
        {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="shrink-0 rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
