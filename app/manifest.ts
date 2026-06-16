import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prode COM - Mundial 2026",
    short_name: "Prode COM",
    description: "El prode del grupo COM para el Mundial de Fútbol 2026",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#060b1a",
    theme_color: "#060b1a",
    orientation: "portrait-primary",
    lang: "es",
    categories: ["sports", "games"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Partidos",
        short_name: "Partidos",
        url: "/dashboard",
        description: "Ver próximos partidos y hacer pronósticos",
        icons: [{ src: "/icon.svg", sizes: "any" }],
      },
      {
        name: "Tabla",
        short_name: "Tabla",
        url: "/leaderboard",
        description: "Ver tabla de posiciones",
        icons: [{ src: "/icon.svg", sizes: "any" }],
      },
      {
        name: "Mis predicciones",
        short_name: "Mis pred.",
        url: "/mis-predicciones",
        description: "Ver mis pronósticos",
        icons: [{ src: "/icon.svg", sizes: "any" }],
      },
    ],
  };
}
