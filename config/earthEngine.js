import ee from "@google/earthengine";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const privateKey = JSON.parse(
  fs.readFileSync(path.join(__dirname, "service-account.json"), "utf-8"),
);
export const initEarthEngine = () => {
  return new Promise((resolve, reject) => {
    ee.data.authenticateViaPrivateKey(
      privateKey,
      () => {
        ee.initialize(null, null, resolve, reject);
      },
      reject,
    );
  });
};
