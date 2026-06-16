import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import PwaRegister from "@/components/PwaRegister";

export const viewport: Viewport = {
  themeColor: "#060b1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Prode COM - Mundial 2026",
  description: "El prode del grupo COM para el Mundial de Fútbol 2026",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Prode COM",
    startupImage: "/icon.svg",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
  other: {
    // Windows tiles
    "msapplication-TileColor": "#060b1a",
    "msapplication-TileImage": "/icon.svg",
    // Android Chrome
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-world-cup">
        <PwaRegister />
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-6 pb-20 sm:pb-6">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
