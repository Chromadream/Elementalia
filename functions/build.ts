import { opendir, readFile, mkdir, rm, writeFile } from "fs/promises";
import { copy } from "fs-extra";
import SwaggerParser from "@apidevtools/swagger-parser";
import Handlebars from "handlebars";
import { exists } from "./exists";

interface SubfolderEntry {
  name: string;
  entrypoint: string;
}

type ApiEntry = string | SubfolderEntry;

export async function build() {
  const apis = await getApisToBuild();
  await generateOutputFolder();
  await copyFilesToCorrectFolder();
  for (const api of apis) {
    await buildRedocDocumentation(api);
  }
  await generateIndexPage(apis);
}

const checkIfValidSchema = async (
  file: string,
  rootDirPath: string
): Promise<boolean> => {
  try {
    await SwaggerParser.validate(`${rootDirPath}${file}`);
    return true;
  } catch (error) {
    return false;
  }
};

const tryToFindEntryPoint = async (
  dirName: string,
  rootDirPath: string
): Promise<SubfolderEntry | null> => {
  const currentPath = `${rootDirPath}${dirName}/`;
  for await (const entry of await opendir(currentPath)) {
    if (entry.isFile()) {
      const lowercaseFilename = entry.name.toLowerCase();
      if (
        (lowercaseFilename.startsWith("swagger") ||
          lowercaseFilename.startsWith("openapi")) &&
        (lowercaseFilename.endsWith("json") ||
          lowercaseFilename.endsWith("yaml") ||
          lowercaseFilename.endsWith("yml"))
      ) {
        if (await checkIfValidSchema(entry.name, currentPath)) {
          return { name: dirName, entrypoint: entry.name };
        }
      }
    }
  }
  return null;
};

async function getApisToBuild(): Promise<ApiEntry[]> {
  const apis: (string | SubfolderEntry)[] = [];
  let rootDirPath = `${process.cwd()}/apis/`;
  let apiDirectory = await opendir(rootDirPath);
  for await (const entry of apiDirectory) {
    if (entry.isFile()) {
      const validSchema = checkIfValidSchema(entry.name, rootDirPath);
      if (validSchema) {
        apis.push(entry.name);
      }
    } else if (entry.isDirectory()) {
      const entryPoint = await tryToFindEntryPoint(entry.name, rootDirPath);
      if (entryPoint) {
        apis.push(entryPoint);
      }
    }
  }
  return apis;
}

async function buildRedocDocumentation(entry: ApiEntry) {
  let template = await readFile("./templates/documentation.mustache");
  let templateString = template.toString();
  let view;
  if (typeof entry === "string") {
    view = {
      specName: entry.split(".")[0],
      specUrl: `apis/${entry}`,
    };
  } else {
    view = {
      specName: entry.name,
      specUrl: `apis/${entry.name}/${entry.entrypoint}`,
    };
  }
  let outputString = Handlebars.compile(templateString)(view);
  await writeFile(
    `${process.cwd()}/finale/pages/${view.specName}.html`,
    outputString
  );
}

const generateOutputFolder = async () => {
  const outputFolder = `${process.cwd()}/finale/`;
  if (await exists(outputFolder)) {
    await rm(outputFolder, { recursive: true, force: true });
  }
  await mkdir(outputFolder);
  await mkdir(`${outputFolder}apis`);
  await mkdir(`${outputFolder}pages`);
};

const copyFilesToCorrectFolder = async (): Promise<void> => {
  // TODO: refactor to only copy useful files
  await copy(`${process.cwd()}/apis/`, `${process.cwd()}/finale/apis/`);
};

const generateIndexPage = async (apis: ApiEntry[]): Promise<void> => {
  const entries: { name: string; path: string }[] = apis
    .map((x) => ({ name: typeof x === "string" ? x : x.name }))
    .map((x) => ({
      ...x,
      path: `pages/${x.name}.html`,
    }));
  let template = await readFile("./templates/index.mustache");
  let templateString = template.toString();
  const view = { entries };
  let outputPage = Handlebars.compile(templateString)(view);
  await writeFile(
    `${process.cwd()}/finale/index.html`,
    outputPage
  );
};
