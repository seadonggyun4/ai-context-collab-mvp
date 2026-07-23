import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const layerRank = { shared: 0, entities: 1, features: 2, widgets: 3, pages: 4, app: 5 } as const;
type Layer = keyof typeof layerRank;

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return collectSourceFiles(path);
    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

function getLayer(file: string): Layer | null {
  const [layer] = relative(sourceRoot, file).split("/");
  return layer !== undefined && layer in layerRank ? (layer as Layer) : null;
}

describe("FSD architecture", () => {
  const files = collectSourceFiles(sourceRoot).filter((file) => !file.endsWith("architecture.test.ts"));

  it("allows dependencies only toward lower FSD layers", () => {
    const violations: string[] = [];

    for (const file of files) {
      const sourceLayer = getLayer(file);
      if (sourceLayer === null) continue;
      const content = readFileSync(file, "utf8");
      const imports = content.matchAll(/from\s+["']@(app|pages|widgets|features|entities|shared)\/([^"']+)["']/g);

      for (const match of imports) {
        const targetLayer = match[1] as Layer;
        if (layerRank[sourceLayer] < layerRank[targetLayer]) {
          violations.push(`${relative(sourceRoot, file)} -> @${targetLayer}/${match[2] ?? ""}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("uses slice public APIs across feature, entity, and widget boundaries", () => {
    const violations: string[] = [];

    for (const file of files) {
      const content = readFileSync(file, "utf8");
      const imports = content.matchAll(/from\s+["']@(entities|features|widgets)\/([^/"']+)\/([^"']+)["']/g);
      for (const match of imports) {
        violations.push(`${relative(sourceRoot, file)} -> @${match[1]}/${match[2]}/${match[3]}`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("contains no superseded technical-layer aliases", () => {
    const violations = files.filter((file) => /@(domain|adapters)\//.test(readFileSync(file, "utf8")));
    expect(violations.map((file) => relative(sourceRoot, file))).toEqual([]);
  });
});
