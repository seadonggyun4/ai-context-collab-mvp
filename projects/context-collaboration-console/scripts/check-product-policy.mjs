import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoots = [path.join(projectRoot, "src"), path.join(projectRoot, "index.html")];
const sourceExtensions = new Set([".css", ".html", ".ts", ".tsx"]);
const ignoredFile = /(?:\.test\.|\.spec\.|\/test\/)/u;

const copyRules = [
  ["MVP 표면 카피", /\bMVP\b/gu],
  ["데모 표면 카피", /데모/gu],
  ["프로토타입 표면 카피", /프로토타입/gu],
  ["실험용 표면 카피", /실험용/gu],
  ["AI 과장 카피", /AI-powered/giu],
  ["추상 혁신 카피", /Next-generation|Revolutionary/giu],
];

const cssRules = [
  ["glass/backdrop blur", /backdrop-filter\s*:/giu],
  ["의미 없는 gradient", /(?:linear|radial|conic)-gradient\s*\(/giu],
  ["neon/glow filter", /filter\s*:\s*(?:drop-shadow|blur)\s*\(/giu],
  ["text glow", /text-shadow\s*:/giu],
];

async function filesAt(target) {
  const stat = await import("node:fs/promises").then(({ stat }) => stat(target));
  if (stat.isFile()) return [target];
  const entries = await readdir(target, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => filesAt(path.join(target, entry.name))));
  return nested.flat();
}

function locations(source, pattern) {
  return [...source.matchAll(pattern)].map((match) => source.slice(0, match.index).split("\n").length);
}

function inspect(file, source) {
  const violations = [];
  const relative = path.relative(projectRoot, file);
  for (const [rule, pattern] of copyRules) {
    for (const line of locations(source, pattern)) violations.push({ file: relative, line, rule });
  }
  if (path.extname(file) === ".css") {
    for (const [rule, pattern] of cssRules) {
      for (const line of locations(source, pattern)) violations.push({ file: relative, line, rule });
    }
    const radiusPattern = /border-radius\s*:\s*([0-9.]+)px/giu;
    for (const match of source.matchAll(radiusPattern)) {
      if (Number(match[1]) > 12) {
        violations.push({ file: relative, line: source.slice(0, match.index).split("\n").length, rule: "12px 초과 radius" });
      }
    }
  }
  return violations;
}

const files = (await Promise.all(sourceRoots.map(filesAt))).flat()
  .filter((file) => sourceExtensions.has(path.extname(file)) && !ignoredFile.test(file));
const results = [];
for (const file of files) results.push(...inspect(file, await readFile(file, "utf8")));

if (results.length > 0) {
  process.stderr.write(`${results.map(({ file, line, rule }) => `${file}:${line} ${rule}`).join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Product policy: ${files.length} files, 0 violations\n`);
}
