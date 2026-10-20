import type { MetadataRoute } from "next";

// Makes the panel installable as an app (Chrome "Instalar", iOS "Adicionar à Tela de Início").
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anamnese Inteligente",
    short_name: "Anamnese",
    description: "Plataforma de anamnese e gestão inteligente para Personal Trainers",
    lang: "pt-BR",
    id: "/dashboard",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#090e1a",
    theme_color: "#090e1a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
