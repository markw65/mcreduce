import { generateOneConfig } from "@markw65/monkeyc-optimizer";
import { xmlUtil } from "@markw65/monkeyc-optimizer/sdk-util.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
async function runBuild(manifestPath, sourcePath) {
  const sourceIn = await fs.readFile(sourcePath, "utf-8");
  if (
    !/if\s*\(gaugeOnTop\)\s*\{\s*ly\s*\+=\s*gaugeHeight1;\s*\}[\s\S]*\bly\b/.test(
      sourceIn
    )
  ) {
    // If the interesting part of the input has been removed,
    // creduce has gone too far. So bail here
    console.log("Fail on entry");
    process.exit(1);
  }
  const buildInfo = {
    sourcePath: [sourcePath],
    excludeAnnotations: [],
    resourcePath: [],
  };
  const manifestData = await fs.readFile(manifestPath);
  const manifestXML = xmlUtil.parseXml(manifestData.toString(), manifestPath);
  const buildConfig = {
    workspace: process.cwd(),
    releaseBuild: false,
    testBuild: false,
    outputPath: "optimized",
    checkInvalidSymbols: "ERROR",
    checkCompilerLookupRules: "OFF",
    sizeBasedPRE: true,
    propagateTypes: true,
    trustDeclaredTypes: true,
    minimizeLocals: false,
    minimizeModules: true,
    singleUseCopyProp: true,
    iterateOptimizer: true,
    checkTypes: "OFF",
  };
  await fs.mkdir(buildConfig.outputPath, { recursive: true });
  const { diagnostics } = await generateOneConfig(
    buildInfo,
    manifestXML,
    [],
    buildConfig
  );
  if (diagnostics && Object.keys(diagnostics).length) {
    console.log(diagnostics);
    process.exit(1);
  }
  const sourceOut = await fs.readFile(
    path.join(buildConfig.outputPath, "source", sourcePath),
    "utf-8"
  );
  if (/if\s*\(gaugeOnTop\)\s*\{\s*ly/.test(sourceOut)) {
    // if it matches, its no longer broken, so bail out.
    console.log("Fail on exit");
    process.exit(1);
  }
  if (!/var\s+ly\s[\s\S]*ly\W/.test(sourceOut)) {
    // if there's no declaration of ly, or no future uses of it, then creduce
    // must have removed too much from the input, so bail out.
    console.log("Fail on exit");
    process.exit(1);
  }
  process.exit(0);
}

await runBuild(
  path.resolve(path.dirname(process.argv[1]), "manifest.xml"),
  "mysource.mc"
);
