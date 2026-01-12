import { access, copyFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = resolve(__dirname, "..");
const clientDir = resolve(projectRoot, "build/client");

const normalize = (value) => value.replace(/^\/+|\/+$/g, "");
const baseDir =
  process.env.LEGATO_BASE && process.env.LEGATO_BASE.trim().length > 0
    ? normalize(process.env.LEGATO_BASE.trim())
    : "legato";

const candidateSources = [
  resolve(clientDir, baseDir, "index.html"),
  resolve(clientDir, "index.html"),
];

const target = resolve(clientDir, "404.html");

async function findExistingSource() {
  for (const candidate of candidateSources) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next candidate
    }
  }
  return null;
}

async function main() {
  const source = await findExistingSource();
  if (!source) {
    console.error(
      "[postbuild] Unable to locate a built index.html to duplicate as 404.html",
    );
    process.exitCode = 1;
    return;
  }

  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
  console.log(`[postbuild] Copied ${source} -> ${target}`);
}

main().catch((error) => {
  console.error("[postbuild] Failed to copy index.html to 404.html");
  console.error(error);
  process.exitCode = 1;
});
