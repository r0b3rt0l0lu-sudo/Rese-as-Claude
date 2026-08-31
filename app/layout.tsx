import type { Metadata } from "next";
import localFont from "next/font/local";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { getCurrentBusiness } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VigilIA — Respondedor de reseñas de Google",
  description: "Genera y aprueba respuestas a reseñas de Google con IA, adaptadas a tu negocio.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const business = await getCurrentBusiness();

  let pendingCount = 0;
  let unreadNotifications = 0;

  if (business) {
    [pendingCount, unreadNotifications] = await Promise.all([
      prisma.review.count({ where: { businessId: business.id, status: "PENDING" } }),
      prisma.notification.count({ where: { businessId: business.id, read: false } }),
    ]);
  }

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${playfair.variable} antialiased`}>
        <Providers>
          {business ? (
            <div className="flex min-h-screen">
              <Sidebar
                businessName={business.name}
                pendingCount={pendingCount}
                unreadNotifications={unreadNotifications}
                autopilotEnabled={business.autopilotEnabled}
              />
              <main className="flex-1 min-w-0">{children}</main>
            </div>
          ) : (
            <main>{children}</main>
          )}
        </Providers>
      </body>
    </html>
  );
}
