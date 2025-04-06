import { setupServer } from "msw/node";
import fetch from "node-fetch";
import { afterAll, afterEach, beforeAll } from "vitest";
import { handlers } from "./handlers";

// Make fetch available globally
// @ts-expect-error - node-fetch types don't match exactly but it works
globalThis.fetch = fetch;

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close()); 