import { CommentStatus } from "@/lib/generated/prisma";
import { createProductComment } from "@/app/(public)/productos/[slug]/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CommentItem = {
  id: string;
  content: string;
  status: CommentStatus;
  createdAt: Date;
  user: {
    id: string;
    nombre: string | null;
    usuario: string;
  };
};

export function ProductCommentsSection({
  productId,
  comments,
  canComment,
  currentUserId,
}: {
  productId: string;
  comments: CommentItem[];
  canComment: boolean;
  currentUserId?: string;
}) {
  return (
    <section className="mt-16 space-y-6">
      <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">Comentarios</h2>

      {canComment ? (
        <form action={createProductComment.bind(null, productId)} className="space-y-3 rounded-lg border border-border p-4">
          <label htmlFor="content" className="text-sm font-medium">Escribe tu comentario</label>
          <Textarea id="content" name="content" placeholder="Comparte tu opinión de este producto" required minLength={3} />
          <Button type="submit">Enviar comentario</Button>
          <p className="text-xs text-muted-foreground">Tu comentario quedará pendiente hasta que un administrador lo apruebe.</p>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Debes iniciar sesión para comentar este producto.</p>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay comentarios para este producto.</p>
        ) : (
          comments.map((comment) => {
            const isPendingOwner = comment.status === CommentStatus.PENDING && comment.user.id === currentUserId;
            return (
              <article key={comment.id} className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{comment.user.nombre || comment.user.usuario}</p>
                    <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString("es-HN")}</p>
                  </div>
                  {isPendingOwner && <Badge variant="secondary">Pendiente</Badge>}
                </div>
                <p className="text-sm text-foreground/90">{comment.content}</p>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
