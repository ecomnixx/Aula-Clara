import { mkdir } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { TwaManifest, TwaGenerator, ConsoleLog } = require("@bubblewrap/core");

const target = path.resolve("android");
await mkdir(target, { recursive: true });

const manifest = await TwaManifest.fromWebManifest(
  "https://aulaclara-docente.vercel.app/manifest.webmanifest",
);
manifest.packageId = "app.aulaclara.docente";
manifest.name = "Aula Clara — Plataforma Docente";
manifest.launcherName = "Aula Clara";
manifest.appVersionCode = 1;
manifest.appVersionName = "1.0.0";
manifest.host = "aulaclara-docente.vercel.app";
manifest.startUrl = "/?source=android";
manifest.signingKey = { path: path.join(target, "android-keystore"), alias: "android" };
manifest.generatorApp = "bubblewrap-cli";

await manifest.saveToFile(path.join(target, "twa-manifest.json"));
await new TwaGenerator().createTwaProject(target, manifest, new ConsoleLog("Aula Clara Android"));
console.log("Projeto Android criado em", target);
