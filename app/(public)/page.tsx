import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "./components/navbar";


export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/mi-perfil");


  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

    </div>
  );
}
