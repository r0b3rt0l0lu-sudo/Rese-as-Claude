import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business";

export default async function Home() {
  // El middleware ya exige sesión para llegar hasta acá.
  const business = await getCurrentBusiness();
  redirect(business ? "/dashboard" : "/login");
}
