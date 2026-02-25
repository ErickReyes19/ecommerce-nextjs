"use client"

import {
    ChevronsUpDown,
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import LogoutButton from "./signOut";

export function NavUser({
    usuario,
}: {
    usuario: {

        IdUser: string;
        User: string;
        Rol: string;
        IdRol: string;

        Permiso: string[];
        Nombre?: string | null;
        FotoUrl?: string | null;

    }
}) {

    return (<SidebarMenu>
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={usuario?.FotoUrl ?? undefined} alt={usuario?.Nombre ?? usuario?.User} />
                            <AvatarFallback className="rounded-lg">{(usuario.Nombre ?? usuario.User).toUpperCase()[0]}</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{usuario?.Nombre ?? usuario?.User}</span>
                            <span className="truncate text-xs">{usuario?.Rol}</span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuItem>
                        <LogoutButton />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    </SidebarMenu>

    )
}