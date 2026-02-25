import { getSession } from "@/auth";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,

  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  ChevronDown, ChevronUp, LayersIcon, Settings, UserIcon,
} from "lucide-react";
import Link from "next/link";
import { NavUser } from "./nav-user";
import { ModeToggle } from "./buton-theme";
import Image from "next/image";

const mantenimientoItems = [
  { title: "Roles", url: "/roles", icon: LayersIcon, permiso: "ver_roles" },
  { title: "Permisos", url: "/permisos", icon: LayersIcon, permiso: "ver_permisos" },
  { title: "Usuarios", url: "/usuarios", icon: UserIcon, permiso: "ver_usuarios" },
];

const items = [
  { title: "Mi Perfil", url: "/mi-perfil", icon: UserIcon, permiso: "ver_mi_perfil" },
];

export async function AppSidebar() {
  const usuario = await getSession();
  const permisosUsuario = usuario?.Permiso || [];


  const filteredItems = items.filter((item) => {
    if (!permisosUsuario.includes(item.permiso)) return false;
    return true;
  });
  const filteredMantenimientoItems = mantenimientoItems.filter((item) => permisosUsuario.includes(item.permiso));
  const showMantenimiento = filteredMantenimientoItems.length > 0;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between items-center">
            <Image
              src="https://d3dr34vkycigpz.cloudfront.net/wp-content/uploads/2025/09/TiempoHonduras-1-2.webp"
              alt="Logo de Tiempo Honduras"
              width={180}
              height={36}
              className="h-9 w-auto"
            />
            <ModeToggle></ModeToggle>
          </SidebarGroupLabel>

          <SidebarGroupContent>


            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon size={16} className="p-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {showMantenimiento && (
                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Settings size={16} className="p-0" />
                        <span>Mantenimiento</span>
                        <ChevronDown className="ml-auto group-data-[state=open]/collapsible:hidden" />
                        <ChevronUp className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {filteredMantenimientoItems.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={item.url}>{item.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{usuario && <NavUser usuario={usuario} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
