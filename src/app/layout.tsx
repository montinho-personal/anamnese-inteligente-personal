import type { Metadata, Viewport } from "next";
import { RegistrarServiceWorker } from "@/components/registrar-sw";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anamnese Inteligente",
  description: "Plataforma de anamnese e gestão inteligente para Personal Trainers",
  applicationName: "Anamnese Inteligente",
  appleWebApp: { capable: true, title: "Anamnese", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#090e1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="overflow-x-hidden">
      <body className="antialiased overflow-x-hidden">
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
