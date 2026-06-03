import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// /admin no se bloquea con Clerk aquí: su layout permite acceso por
// llave-enlace (cookie) o por rol admin de Clerk.
const isProtected = createRouteMatcher([
  "/app(.*)",
  "/driver(.*)",
  "/ops(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtected(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
