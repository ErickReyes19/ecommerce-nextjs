"use server";

import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { PermisosRol } from "../roles/schema";
import { Permiso as PermisoDTO } from "./schema";

export async function getPermisos(): Promise<PermisoDTO[]> {
  try {
    const permisos = await prisma.permiso.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });

    return permisos.map((p: { id: string; nombre: string; descripcion: string; activo: boolean }) => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      activo: p.activo,
    }));
  } catch (error) {
    console.error("Error al obtener los permisos:", error);
    return [];
  }
}

export async function getPermisoById(id: string): Promise<PermisoDTO | null> {
  try {
    const permiso = await prisma.permiso.findUnique({ where: { id } });
    if (!permiso) return null;

    return {
      id: permiso.id,
      nombre: permiso.nombre,
      descripcion: permiso.descripcion,
      activo: permiso.activo,
    };
  } catch (error) {
    console.error("Error al obtener permiso por id:", error);
    return null;
  }
}

export async function createPermiso(payload: PermisoDTO): Promise<PermisoDTO | null> {
  try {
    const created = await prisma.permiso.create({
      data: {
        id: randomUUID(),
        nombre: payload.nombre,
        descripcion: payload.descripcion,
        activo: true,
      },
    });

    return {
      id: created.id,
      nombre: created.nombre,
      descripcion: created.descripcion,
      activo: created.activo,
    };
  } catch (error) {
    console.error("Error al crear permiso:", error);
    return null;
  }
}

export async function updatePermiso(payload: PermisoDTO): Promise<PermisoDTO | null> {
  if (!payload.id) return null;

  try {
    const updated = await prisma.permiso.update({
      where: { id: payload.id },
      data: {
        nombre: payload.nombre,
        descripcion: payload.descripcion,
        activo: payload.activo,
      },
    });

    return {
      id: updated.id,
      nombre: updated.nombre,
      descripcion: updated.descripcion,
      activo: updated.activo,
    };
  } catch (error) {
    console.error("Error al actualizar permiso:", error);
    return null;
  }
}

export async function getPermisosForRoles(): Promise<PermisosRol[]> {
  try {
    const permisos = await prisma.permiso.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });

    return permisos.map((p: { id: string; nombre: string; descripcion: string; activo: boolean }) => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      activo: p.activo,
    }));
  } catch (error) {
    console.error("Error al obtener los permisos:", error);
    return [];
  }
}
