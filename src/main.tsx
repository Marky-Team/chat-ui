import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { StreamProvider } from "./providers/Stream.tsx";
import { ThreadProvider } from "./providers/Thread.tsx";

async function main() {
  if (process.env.NODE_ENV === "development") {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass", // Don't warn about unhandled requests
    });
  }

  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <NuqsAdapter>
        <ThreadProvider>
          <StreamProvider>
            <App />
          </StreamProvider>
        </ThreadProvider>
        <Toaster />
      </NuqsAdapter>
    </BrowserRouter>,
  );
}

main().catch(console.error);
