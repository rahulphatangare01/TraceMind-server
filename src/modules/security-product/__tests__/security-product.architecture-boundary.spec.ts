import { existsSync, readFileSync, readdirSync } from "node:fs";
import {
  dirname,
  extname,
  relative,
  isAbsolute,
  resolve,
  sep,
} from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const securityProductRoot = resolve(
  repositoryRoot,
  "src/modules/security-product",
);
const securityCoreRoot = resolve(repositoryRoot, "src/modules/security-core");
const iamRoot = resolve(repositoryRoot, "src/modules/iam");

const sourceExtensions = new Set([".ts", ".tsx", ".mts", ".cts"]);

interface ImportReference {
  readonly specifier: string;
  readonly line: number;
}

interface SourceFile {
  readonly absolutePath: string;
  readonly relativePath: string;
  readonly source: string;
}

const toPosix = (value: string): string => value.split(sep).join("/");

// const isWithin = (parent: string, candidate: string): boolean => {
//   const path = relative(parent, candidate);

//   return (
//     path === "" ||
//     (path !== ".." &&
//       !path.startsWith(`..${sep}`) &&
//       !path.startsWith(`../`) &&
//       !resolve(path).startsWith(resolve("..")))
//   );
// };
const isWithin = (parent: string, candidate: string): boolean => {
  const path = relative(parent, candidate);

  return (
    path === "" ||
    (path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path))
  );
};
const collectSourceFiles = (directory: string): string[] => {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === "__tests__" ||
        entry.name === "node_modules" ||
        entry.name === "dist" ||
        entry.name === "coverage"
      ) {
        return [];
      }

      return collectSourceFiles(absolutePath);
    }

    if (!entry.isFile() || !sourceExtensions.has(extname(entry.name))) {
      return [];
    }

    return [absolutePath];
  });
};

const readSourceFiles = (root: string): SourceFile[] =>
  collectSourceFiles(root).map((absolutePath) => ({
    absolutePath,
    relativePath: toPosix(relative(repositoryRoot, absolutePath)),
    source: readFileSync(absolutePath, "utf8"),
  }));

const extractImports = (source: string): ImportReference[] => {
  const result: ImportReference[] = [];
  const pattern = /\b(?:from\s*|import\s*\(\s*|import\s*)["']([^"']+)["']/g;

  for (const match of source.matchAll(pattern)) {
    const specifier = match[1];

    if (!specifier) {
      continue;
    }

    const index = match.index ?? 0;

    result.push({
      specifier,
      line: source.slice(0, index).split("\n").length,
    });
  }

  return result;
};

const resolveRelativeImport = (
  sourceFile: string,
  specifier: string,
): string | undefined => {
  if (!specifier.startsWith(".")) {
    return undefined;
  }

  return resolve(dirname(sourceFile), specifier);
};

const referencesModule = (
  sourceFile: string,
  specifier: string,
  moduleRoot: string,
): boolean => {
  const normalizedSpecifier = specifier.replaceAll("\\", "/");

  if (
    normalizedSpecifier.includes("/modules/security-core/") ||
    normalizedSpecifier.includes("/modules/security-product/") ||
    normalizedSpecifier.includes("/modules/iam/")
  ) {
    // const moduleName = moduleRoot.split(sep).at(-1);
    const moduleName = moduleRoot.slice(moduleRoot.lastIndexOf(sep) + 1);

    if (moduleName && normalizedSpecifier.includes(`/modules/${moduleName}/`)) {
      return true;
    }
  }

  const target = resolveRelativeImport(sourceFile, specifier);

  return target !== undefined && isWithin(moduleRoot, target);
};

const isSecurityCorePublicApi = (
  sourceFile: string,
  specifier: string,
): boolean => {
  const target = resolveRelativeImport(sourceFile, specifier);

  if (target !== undefined && isWithin(securityCoreRoot, target)) {
    return /(^|[\\/])public-api(?:\.(?:[cm]?[jt]sx?))?$/.test(target);
  }

  return /(?:^|\/)modules\/security-core\/public-api(?:\.[cm]?[jt]sx?)?$/.test(
    specifier.replaceAll("\\", "/"),
  );
};

const productFiles = readSourceFiles(securityProductRoot);
const coreFiles = readSourceFiles(securityCoreRoot);

describe("Security Product architecture boundaries", () => {
  it("has production source files available for boundary analysis", () => {
    expect(productFiles.length).toBeGreaterThan(0);
  });

  it("does not import concrete IAM implementation modules", () => {
    const violations: string[] = [];

    for (const file of productFiles) {
      for (const reference of extractImports(file.source)) {
        const target = resolveRelativeImport(
          file.absolutePath,
          reference.specifier,
        );

        const directIamImport = /(?:^|\/)modules\/iam(?:\/|$)/.test(
          reference.specifier.replaceAll("\\", "/"),
        );

        if (
          directIamImport ||
          (target !== undefined && isWithin(iamRoot, target))
        ) {
          violations.push(
            `${file.relativePath}:${reference.line} -> ${reference.specifier}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("imports Security Core only through its curated public API", () => {
    const violations: string[] = [];

    // for (const file of productFiles) {
    //   for (const reference of extractImports(file.source)) {
    for (const file of productFiles) {
      // The composition root may wire concrete module containers.
      // Application and domain code must still use the public API.
      if (
        file.relativePath ===
        "src/modules/security-product/security-product.container.ts"
      ) {
        continue;
      }

      for (const reference of extractImports(file.source)) {
        if (
          referencesModule(
            file.absolutePath,
            reference.specifier,
            securityCoreRoot,
          ) &&
          !isSecurityCorePublicApi(file.absolutePath, reference.specifier)
        ) {
          violations.push(
            `${file.relativePath}:${reference.line} -> ${reference.specifier}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps domain and application layers independent of infrastructure", () => {
    const violations: string[] = [];

    for (const file of productFiles) {
      const isDomainOrApplication =
        /\/modules\/security-product\/(?:domain|application)\//.test(
          `/${file.relativePath}`,
        );

      if (!isDomainOrApplication) {
        continue;
      }

      for (const reference of extractImports(file.source)) {
        const target = resolveRelativeImport(
          file.absolutePath,
          reference.specifier,
        );
        const normalizedSpecifier = reference.specifier.replaceAll("\\", "/");
        const normalizedTarget = target ? toPosix(target) : normalizedSpecifier;

        const infrastructureImport =
          /\/infrastructure\//.test(normalizedTarget) ||
          /\/repositories\/mysql\//.test(normalizedTarget) ||
          /\/database\//.test(normalizedTarget) ||
          /(?:^|\/)database(?:\/|$)/.test(normalizedSpecifier);

        if (infrastructureImport) {
          violations.push(
            `${file.relativePath}:${reference.line} -> ${reference.specifier}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps Security Core independent of Security Product", () => {
    const violations: string[] = [];

    for (const file of coreFiles) {
      for (const reference of extractImports(file.source)) {
        if (
          referencesModule(
            file.absolutePath,
            reference.specifier,
            securityProductRoot,
          )
        ) {
          violations.push(
            `${file.relativePath}:${reference.line} -> ${reference.specifier}`,
          );
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("includes the architecture and dependency specifications", () => {
    expect(existsSync(resolve(securityProductRoot, "ARCHITECTURE.md"))).toBe(
      true,
    );

    expect(
      existsSync(resolve(securityProductRoot, "DEPENDENCY_RULES.md")),
    ).toBe(true);
  });
});
