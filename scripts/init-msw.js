import { execSync } from "child_process";
import { mkdir } from "fs/promises";

async function main() {
  // Create the public directory if it doesn't exist
  await mkdir("public", { recursive: true });

  // Run MSW init command
  execSync("npx msw init public/ --no-save");

  console.log("✅ MSW service worker initialized");
}

main().catch(console.error); 