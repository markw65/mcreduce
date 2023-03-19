import { generateOneConfig } from "@markw65/monkeyc-optimizer";
import { xmlUtil } from "@markw65/monkeyc-optimizer/sdk-util.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
async function runBuild(manifestPath, sourcePath) {
  const sourceIn = await fs.readFile(sourcePath, "utf-8");
  if (
    !/if\s*\(gaugeOnTop\)\s*\{\s*ly\s*\+=\s*gaugeHeight1;\s*\}/.test(sourceIn)
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
    checkInvalidSymbols: "OFF",
    checkCompilerLookupRules: "OFF",
    sizeBasedPRE: true,
    propagateTypes: true,
    trustDeclaredTypes: true,
    minimizeLocals: true,
    minimizeModules: true,
    singleUseCopyProp: true,
    iterateOptimizer: true,
    checkTypes: "OFF",
  };
  await fs.mkdir(buildConfig.outputPath, { recursive: true });
  await generateOneConfig(buildInfo, manifestXML, [], buildConfig);
  const sourceOut = await fs.readFile(
    path.join(buildConfig.outputPath, "source", sourcePath),
    "utf-8"
  );
  if (
    !/if\s*\(gaugeOnTop\)\s*\{\s*y.*\+=\s*gaugeHeight1;\s*\}/.test(sourceOut)
  ) {
    // if it doesn't match, we've gone too far.
    console.log("Fail on exit");
    process.exit(1);
  }
  process.exit(0);
}

await runBuild(
  path.resolve(path.dirname(process.argv[1]), "manifest.xml"),
  "mysource.mc"
);
