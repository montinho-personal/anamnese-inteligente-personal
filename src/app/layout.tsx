import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anamnese Inteligente",
  description: "Plataforma de anamnese e gestão inteligente para Personal Trainers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
