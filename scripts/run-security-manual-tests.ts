import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";

const testRoot = resolve("src/modules/security-core/__tests__");

function findManualTests(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      return findManualTests(fullPath);
    }

    if (entry.isFile() && entry.name.endsWith(".manual.ts")) {
      return [fullPath];
    }

    return [];
  });
}

if (!existsSync(testRoot)) {
  console.error(`Test directory not found: ${testRoot}`);
  process.exit(1);
}

const files = findManualTests(testRoot).sort();

if (files.length === 0) {
  console.error("No *.manual.ts files found.");
  process.exit(1);
}

const failures: string[] = [];

console.log(`Found ${files.length} security manual test files.\n`);

for (const [index, file] of files.entries()) {
  const displayPath = relative(process.cwd(), file);

  console.log(`\n[${index + 1}/${files.length}] ${displayPath}`);

  const result = spawnSync(process.execPath, ["--import", "tsx", file], {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`Runner error: ${result.error.message}`);
    failures.push(displayPath);
  } else if (result.status !== 0) {
    console.error(`FAILED: ${displayPath}`);
    failures.push(displayPath);
  } else {
    console.log(`PASSED: ${displayPath}`);
  }
}

console.log("\n========== MANUAL TEST SUMMARY ==========");
console.log(`Total files: ${files.length}`);
console.log(`Passed: ${files.length - failures.length}`);
console.log(`Failed: ${failures.length}`);

if (failures.length > 0) {
  console.error("\nFailed files:");

  for (const file of failures) {
    console.error(`- ${file}`);
  }

  process.exitCode = 1;
} else {
  console.log("\nAll security manual test files passed.");
}
