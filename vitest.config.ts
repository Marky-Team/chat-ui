import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["src/mocks/setup.ts"],
    deps: {
      inline: ["msw"],
    },
  },
}); 