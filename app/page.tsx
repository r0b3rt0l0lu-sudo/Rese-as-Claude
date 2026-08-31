import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business";

export default async function Home() {
  const business = await getCurrentBusiness();
  redirect(business ? "/dashboard" : "/onboarding");
}
