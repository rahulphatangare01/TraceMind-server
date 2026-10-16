import { readdirSync, readFileSync } from "node:fs";
import {
  dirname,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";

interface ImportReference {
  readonly specifier: string;
  readonly line: number;
}

interface DependencyViolation {
  readonly file: string;
  readonly line: number;
  readonly rule: string;
  readonly specifier: string;
}

const repositoryRoot = process.cwd();
const securityProductRoot = resolve(
  repositoryRoot,
  "src/modules/security-product",
);
const securityCoreRoot = resolve(repositoryRoot, "src/modules/security-core");
const sourceExtensions = new Set([".ts", ".tsx", ".mts", ".cts"]);

const toPosixPath = (value: string): string => value.split(sep).join("/");

const isInside = (parent: string, candidate: string): boolean => {
  const relativePath = relative(parent, candidate);

  return (
    relativePath === "" ||
    (!relativePath.startsWith(`..${sep}`) &&
      relativePath !== ".." &&
      !isAbsolute(relativePath))
  );
};

const listSourceFiles = (directory: string): string[] => {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === "__tests__" ||
        entry.name === "node_modules" ||
        entry.name === "dist"
      ) {
        return [];
      }

      return listSourceFiles(absolutePath);
    }

    if (!entry.isFile() || !sourceExtensions.has(extname(entry.name))) {
      return [];
    }

    return [absolutePath];
  });
};

const extractImports = (source: string): ImportReference[] => {
  const references: ImportReference[] = [];
  const importPattern = /\b(?:from\s*|import\s*\(\s*)["']([^"']+)["']/g;

  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1];

    if (!specifier) {
      continue;
    }

    const matchIndex = match.index ?? 0;
    const line = source.slice(0, matchIndex).split("\n").length;

    references.push({ specifier, line });
  }

  return references;
};

const resolveImportTarget = (
  sourceFile: string,
  specifier: string,
): string | undefined => {
  if (!specifier.startsWith(".")) {
    return undefined;
  }

  return resolve(dirname(sourceFile), specifier);
};

const isSecurityCorePublicApi = (target: string): boolean => {
  const normalized = toPosixPath(target);

  return (
    normalized.endsWith("/modules/security-core/public-api.ts") ||
    normalized.endsWith("/modules/security-core/public-api.js") ||
    normalized.endsWith("/modules/security-core/public-api")
  );
};

const violations: DependencyViolation[] = [];
const productionFiles = listSourceFiles(securityProductRoot);

for (const file of productionFiles) {
  const source = readFileSync(file, "utf8");
  const normalizedFile = toPosixPath(file);
  const relativeFile = toPosixPath(relative(repositoryRoot, file));

  for (const reference of extractImports(source)) {
    const { specifier, line } = reference;
    const normalizedSpecifier = specifier.replaceAll("\\", "/");
    const resolvedTarget = resolveImportTarget(file, specifier);
    const normalizedTarget = resolvedTarget
      ? toPosixPath(resolvedTarget)
      : normalizedSpecifier;

    // Rule 1: Security Product must not depend on concrete IAM code.
    if (
      /(^|\/)modules\/iam(\/|$)/.test(normalizedSpecifier) ||
      (resolvedTarget !== undefined &&
        isInside(resolve(repositoryRoot, "src/modules/iam"), resolvedTarget))
    ) {
      violations.push({
        file: relativeFile,
        line,
        rule: "Do not import concrete IAM implementations.",
        specifier,
      });
    }

    // Rule 2: Security Core dependencies must use its curated public API.
    const referencesSecurityCore =
      /(^|\/)modules\/security-core(\/|$)/.test(normalizedSpecifier) ||
      (resolvedTarget !== undefined &&
        isInside(
          resolve(repositoryRoot, "src/modules/security-core"),
          resolvedTarget,
        ));

    if (
      referencesSecurityCore &&
      !isSecurityCorePublicApi(normalizedTarget) &&
      !isSecurityCorePublicApi(specifier)
    ) {
      violations.push({
        file: relativeFile,
        line,
        rule: "Import Security Core through security-core/public-api only.",
        specifier,
      });
    }

    // Rule 3: Domain/application layers must not depend on infrastructure.
    const isDomainOrApplication =
      /\/modules\/security-product\/(domain|application)\//.test(
        normalizedFile,
      );

    const referencesInfrastructure =
      /\/infrastructure\//.test(normalizedTarget) ||
      /\/repositories\/mysql\//.test(normalizedTarget) ||
      /\/database\//.test(normalizedTarget) ||
      /(^|\/)database(\/|$)/.test(normalizedSpecifier);

    if (isDomainOrApplication && referencesInfrastructure) {
      violations.push({
        file: relativeFile,
        line,
        rule: "Domain/application code must not import infrastructure or database implementations.",
        specifier,
      });
    }
  }
}

if (violations.length > 0) {
  console.error("Security Product dependency rule violations:");

  for (const violation of violations) {
    console.error(
      `- ${violation.file}:${violation.line} — ${violation.rule} Import: "${violation.specifier}"`,
    );
  }

  process.exitCode = 1;
} else {
  console.log(
    `Security Product dependency check passed (${productionFiles.length} production source files scanned).`,
  );
}
// Rule 4: Security Core must not depend on Security Product.
for (const file of listSourceFiles(securityCoreRoot)) {
  const source = readFileSync(file, "utf8");
  const relativeFile = toPosixPath(relative(repositoryRoot, file));

  for (const reference of extractImports(source)) {
    const resolvedTarget = resolveImportTarget(file, reference.specifier);
    const importsSecurityProduct =
      /(^|\/)modules\/security-product(\/|$)/.test(
        reference.specifier.replaceAll("\\", "/"),
      ) ||
      (resolvedTarget !== undefined &&
        isInside(securityProductRoot, resolvedTarget));

    if (importsSecurityProduct) {
      violations.push({
        file: relativeFile,
        line: reference.line,
        rule: "Security Core must not depend on Security Product.",
        specifier: reference.specifier,
      });
    }
  }
}
