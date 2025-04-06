import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

// Expose worker on window in development
if (process.env.NODE_ENV === "development") {
  (window as any).msw = { worker };
} 