import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(projectRoot, "dist");
const budget = JSON.parse(await readFile(path.join(projectRoot, "quality/performance-budget.json"), "utf8"));

async function filesAt(target) {
  const entries = await readdir(target, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const item = path.join(target, entry.name);
    return entry.isDirectory() ? filesAt(item) : [item];
  }));
  return nested.flat();
}

const files = await filesAt(distRoot);
const assets = await Promise.all(files.map(async (file) => {
  const bytes = await readFile(file);
  return {
    file: path.relative(distRoot, file),
    raw: (await stat(file)).size,
    gzip: gzipSync(bytes, { level: 9 }).byteLength,
  };
}));
const assetsByFile = new Map(assets.map((asset) => [asset.file, asset]));
const javascript = assets.filter(({ file }) => file.endsWith(".js"));
const css = assets.filter(({ file }) => file.endsWith(".css"));
const total = (items, field) => items.reduce((sum, item) => sum + item[field], 0);
const largestJavaScript = javascript.toSorted((left, right) => right.gzip - left.gzip)[0];
const manifest = JSON.parse(await readFile(path.join(distRoot, ".vite/manifest.json"), "utf8"));
const entry = Object.entries(manifest).find(([, value]) => value.isEntry);
if (entry === undefined) throw new Error("Vite manifest does not contain an entry chunk");
const initialFiles = new Set();
function collectInitial(key) {
  const item = manifest[key];
  if (item === undefined) throw new Error(`Vite manifest references an unknown chunk: ${key}`);
  initialFiles.add(item.file);
  for (const imported of item.imports ?? []) collectInitial(imported);
}
collectInitial(entry[0]);
const initialJavascript = [...initialFiles]
  .filter((file) => file.endsWith(".js"))
  .map((file) => assetsByFile.get(file))
  .filter((asset) => asset !== undefined);
const checks = [
  ["initial JavaScript total gzip", total(initialJavascript, "gzip"), budget.maxInitialJavaScriptTotalGzipBytes],
  ["largest JavaScript chunk gzip", largestJavaScript?.gzip ?? 0, budget.maxJavaScriptChunkGzipBytes],
  ["JavaScript total gzip", total(javascript, "gzip"), budget.maxJavaScriptTotalGzipBytes],
  ["CSS total gzip", total(css, "gzip"), budget.maxCssTotalGzipBytes],
  ["all assets raw", total(assets, "raw"), budget.maxAssetTotalBytes],
];

for (const [label, actual, limit] of checks) {
  process.stdout.write(`${label}: ${actual} / ${limit} bytes\n`);
}
if (largestJavaScript !== undefined) process.stdout.write(`largest chunk: ${largestJavaScript.file}\n`);

const failed = checks.filter(([, actual, limit]) => actual > limit);
if (failed.length > 0) {
  process.stderr.write(`Performance budget exceeded: ${failed.map(([label]) => label).join(", ")}\n`);
  process.exitCode = 1;
}
