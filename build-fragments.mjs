// Build script: extracts each Google Stitch screen into a clean SPA fragment.
// - Keeps <style> blocks (needed for per-screen visuals; applied when injected).
// - Strips demo <script> blocks and the per-screen fixed bottom navs (the shell
//   provides unified, role-aware navigation).
// - Preserves the original <body> classes on a wrapper so layout intent survives.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const SRC = join(root, "transport-jalisco", "stitch_mt_empresarial_operations_platform");
const OUT = join(root, "screens");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const screens = [
  "splash_screen", "role_selection", "user_home", "request_transportation",
  "my_services", "service_detail", "notifications_center", "active_service",
  "driver_dashboard", "driver_management", "assignment_center",
  "dispatcher_dashboard", "fleet_management", "operations_map",
];

// Per-screen tweaks: swap the placeholder Stitch logo/branding for the real
// MT Empresarial logo so the change survives regeneration.
const LOGO = "icons/logo.png";
const tweaks = {
  splash_screen: (s) => s
    .replace(
      /<img alt="MT Empresarial Logo"[\s\S]*?\/>/i,
      `<img alt="MT Empresarial" class="w-72 md:w-80 rounded-2xl bg-white p-5 shadow-2xl" src="${LOGO}"/>`
    )
    // The real logo already carries the name + tagline, so drop the duplicate text.
    .replace(/<div class="mt-xs">[\s\S]*?TU DESTINO, NUESTRA RUTA[\s\S]*?<\/div>/i, ""),
  role_selection: (s) => s.replace(
    /<div class="mb-12 flex flex-col items-center">[\s\S]*?Tu destino, nuestra ruta<\/p>\s*<\/div>/i,
    `<div class="mb-12 flex flex-col items-center"><img alt="MT Empresarial — Tu destino, nuestra ruta" class="w-64 md:w-72" src="${LOGO}"/></div>`
  ),
};

for (const id of screens) {
  const file = join(SRC, id, "code.html");
  const html = readFileSync(file, "utf8");

  // Collect every <style> block from the whole document.
  const styles = [...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/gi)].map((m) => m[0]);

  // Grab the <body ...> opening tag (for its classes) and its inner HTML.
  const bodyOpen = html.match(/<body([^>]*)>/i);
  const bodyClasses = (bodyOpen?.[1].match(/class="([^"]*)"/i)?.[1] || "").trim();
  let inner = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";

  // Remove demo scripts and the per-screen fixed bottom navigation.
  inner = inner.replace(/<script[\s\S]*?<\/script>/gi, "");
  inner = inner.replace(/<nav\b[^>]*fixed bottom-0[\s\S]*?<\/nav>/gi, "");
  // Strip inline event handlers (onclick=…) that referenced now-removed demo
  // scripts, so taps are handled solely by the shell's delegated router.
  inner = inner.replace(/\son[a-z]+="[^"]*"/gi, "");
  inner = inner.replace(/\son[a-z]+='[^']*'/gi, "");

  if (tweaks[id]) inner = tweaks[id](inner);
  // Drop any style blocks that lived inside the body (we re-add them once, on top).
  inner = inner.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  const fragment =
    `<!-- screen: ${id} | generated from Google Stitch export -->\n` +
    styles.join("\n") + "\n" +
    `<div class="screen-root ${bodyClasses}">\n${inner.trim()}\n</div>\n`;

  writeFileSync(join(OUT, `${id}.html`), fragment, "utf8");
  process.stdout.write(`built ${id}.html (${fragment.length} bytes)\n`);
}
console.log("done");
