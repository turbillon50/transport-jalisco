/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  eslint: {
    // Production builds shouldn't fail on lint; lint runs separately in CI.
    ignoreDuringBuilds: true,
  },
  async redirects() {
    // Alias raiz -> paginas legales (estandar Vulcano espera /terminos etc.)
    return [
      { source: "/terminos", destination: "/legal/terminos", permanent: true },
      { source: "/privacidad", destination: "/legal/privacidad", permanent: true },
      { source: "/eliminar-cuenta", destination: "/legal/eliminar-cuenta", permanent: true },
      { source: "/reembolsos", destination: "/legal/cancelacion", permanent: true },
      { source: "/cancelacion", destination: "/legal/cancelacion", permanent: true },
    ];
  },
};

export default nextConfig;
