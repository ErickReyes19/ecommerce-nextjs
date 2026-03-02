import { getSession } from "@/auth";
import NoAcceso from "@/components/noAccess";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CommentStatus } from "@/lib/generated/prisma";
import { getAdminProductComments, moderateProductComment } from "./actions";

const statusLabel: Record<CommentStatus, string> = {
  APPROVED: "Aprobado",
  PENDING: "Pendiente",
  REJECTED: "Rechazado",
};

const statusVariant: Record<CommentStatus, "default" | "secondary" | "destructive"> = {
  APPROVED: "default",
  PENDING: "secondary",
  REJECTED: "destructive",
};

function mapStatus(value?: string): CommentStatus | undefined {
  if (!value) return undefined;
  if (value === CommentStatus.APPROVED) return CommentStatus.APPROVED;
  if (value === CommentStatus.PENDING) return CommentStatus.PENDING;
  if (value === CommentStatus.REJECTED) return CommentStatus.REJECTED;
  return undefined;
}

export default async function ComentariosAdminPage({ searchParams }: { searchParams: { status?: string } }) {
  const session = await getSession();
  if (!session?.IdUser || session.Rol !== "ADMIN") return <NoAcceso />;

  const filterStatus = mapStatus(searchParams.status);
  const comments = await getAdminProductComments(filterStatus);

  return (
    <div className="container mx-auto space-y-4 py-4">
      <h1 className="text-2xl font-bold">Moderación de comentarios</h1>

      <div className="flex flex-wrap gap-2">
        <a href="/comentarios"><Button variant={!filterStatus ? "default" : "outline"}>Todos</Button></a>
        <a href="/comentarios?status=PENDING"><Button variant={filterStatus === CommentStatus.PENDING ? "default" : "outline"}>Pendientes</Button></a>
        <a href="/comentarios?status=APPROVED"><Button variant={filterStatus === CommentStatus.APPROVED ? "default" : "outline"}>Aprobados</Button></a>
        <a href="/comentarios?status=REJECTED"><Button variant={filterStatus === CommentStatus.REJECTED ? "default" : "outline"}>Rechazados</Button></a>
      </div>

      <div className="space-y-3">
        {comments.length === 0 ? (
          <Card className="p-4 text-sm text-muted-foreground">No hay comentarios para este filtro.</Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{comment.product.name}</p>
                <Badge variant={statusVariant[comment.status]}>{statusLabel[comment.status]}</Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                Autor: {comment.user.nombre || comment.user.usuario} · {new Date(comment.createdAt).toLocaleString("es-HN")}
              </p>
              <p className="text-sm">{comment.content}</p>

              <div className="flex gap-2">
                <form action={moderateProductComment.bind(null, comment.id, CommentStatus.APPROVED)}>
                  <Button type="submit" size="sm">Aprobar</Button>
                </form>
                <form action={moderateProductComment.bind(null, comment.id, CommentStatus.REJECTED)}>
                  <Button type="submit" size="sm" variant="destructive">Rechazar</Button>
                </form>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
