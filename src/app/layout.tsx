import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mtempresarial.life";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "MT Empresarial · Logística de Confianza",
    template: "%s · MT Empresarial",
  },
  description:
    "Plataforma de operaciones de transporte empresarial en Jalisco: solicita traslados, gestiona flota, choferes y rastrea servicios en vivo.",
  applicationName: "MT Empresarial",
  manifest: "/manifest.webmanifest",
  keywords: ["transporte empresarial", "Jalisco", "Guadalajara", "traslados", "logística", "flota"],
  authors: [{ name: "MT Empresarial" }],
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "MT Empresarial" },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: APP_URL,
    siteName: "MT Empresarial",
    title: "MT Empresarial · Logística de Confianza",
    description: "Transporte empresarial premium en Jalisco. Tu destino, nuestra ruta.",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "MT Empresarial" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MT Empresarial · Logística de Confianza",
    description: "Transporte empresarial premium en Jalisco.",
    images: ["/icons/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#002863" },
    { media: "(prefers-color-scheme: dark)", color: "#091018" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning className={inter.variable}>
        <head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          />
        </head>
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
