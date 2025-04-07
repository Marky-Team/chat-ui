import { MarkyLogoSVG } from "@/components/icons/marky";
import { getApiKey } from "@/lib/api-key";
import { type Message } from "@langchain/langgraph-sdk";
import { useStream } from "@langchain/langgraph-sdk/react";
import {
  uiMessageReducer,
  type RemoveUIMessage,
  type UIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { useQueryState } from "nuqs";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { useThreads } from "./Thread";

export type StateType = { messages: Message[]; ui?: UIMessage[] };

const useTypedStream = useStream<
  StateType,
  {
    UpdateType: {
      messages?: Message[] | Message | string;
      ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
    };
    CustomEventType: UIMessage | RemoveUIMessage;
  }
>;

type StreamContextType = ReturnType<typeof useTypedStream>;
const StreamContext = createContext<StreamContextType | undefined>(undefined);

const AuthRequiredPopup: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen w-full p-4">
    <div className="animate-in fade-in-0 zoom-in-95 flex flex-col border bg-background shadow-lg rounded-lg max-w-3xl">
      <div className="flex flex-col gap-2 mt-14 p-6 border-b">
        <div className="flex items-start flex-col gap-2">
          <MarkyLogoSVG className="h-7" />
          <h1 className="text-xl font-semibold tracking-tight">
            Authentication Required
          </h1>
        </div>
        <p className="text-muted-foreground">
          {message}
          <br />
          Please close this page and re-open from Marky to get a properly
          authenticated URL.
        </p>
      </div>
    </div>
  </div>
);

async function sleep(ms = 4000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkGraphStatus(
  apiUrl: string,
  apiKey: string | null,
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/info`, {
      ...(apiKey && {
        headers: {
          "X-Api-Key": apiKey,
        },
      }),
    });

    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

const StreamSession = ({
  children,
  apiKey,
  apiUrl,
  assistantId,
  businessId,
}: {
  children: ReactNode;
  apiKey: string | null;
  apiUrl: string;
  assistantId: string;
  businessId: string;
}) => {
  const [threadId, setThreadId] = useQueryState("threadId");
  const [token] = useQueryState("token");
  const { getThreads, setThreads } = useThreads();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const streamValue = useTypedStream({
    apiUrl,
    apiKey: apiKey ?? undefined,
    defaultHeaders: {
      Authorization: `Bearer ${token}`,
      "X-Brand-Id": businessId,
    },
    assistantId,
    threadId: threadId ?? null,
    onCustomEvent: (event, options) => {
      options.mutate((prev) => {
        const ui = uiMessageReducer(prev.ui ?? [], event);
        return { ...prev, ui };
      });
    },
    onThreadId: (id) => {
      setThreadId(id);
      sleep().then(() => getThreads().then(setThreads).catch(console.error));
    },
  });

  // Load thread history on mount
  useEffect(() => {
    if (threadId) {
      setIsLoadingHistory(true);
      getThreads()
        .then(setThreads)
        .catch(console.error)
        .finally(() => setIsLoadingHistory(false));
    } else {
      setIsLoadingHistory(false);
    }
  }, [threadId, getThreads, setThreads]);

  // Check graph status
  useEffect(() => {
    checkGraphStatus(apiUrl, apiKey).then((ok) => {
      if (!ok) {
        toast.error("Failed to connect to LangGraph server", {
          description: () => (
            <p>
              Please ensure your graph is running at <code>{apiUrl}</code> and
              your API key is correctly set (if connecting to a deployed graph).
            </p>
          ),
          duration: 10000,
          richColors: true,
          closeButton: true,
        });
      }
    });
  }, [apiKey, apiUrl]);

  // Send automatic hello message when component mounts (only if no existing thread)
  useEffect(() => {
    if (
      !hasInitialized &&
      streamValue.submit &&
      !isLoadingHistory &&
      !threadId
    ) {
      streamValue.submit(
        { messages: "hello" },
        {
          streamMode: ["values"],
          optimisticValues: (prev) => ({
            ...prev,
            messages: [
              ...(prev.messages ?? []),
              { type: "human", content: "hello" },
            ],
          }),
        },
      );
      setHasInitialized(true);
    }
  }, [hasInitialized, streamValue, isLoadingHistory, threadId]);

  // Show popup if token or businessId is missing
  if (!token) {
    return (
      <AuthRequiredPopup message="The URL should include a token parameter for authentication." />
    );
  }

  if (!businessId) {
    return (
      <AuthRequiredPopup message="The URL should include a businessId parameter." />
    );
  }

  return (
    <StreamContext.Provider value={streamValue}>
      {children}
    </StreamContext.Provider>
  );
};

export const StreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Get environment variables - these should be set in .env
  const apiUrl = import.meta.env.VITE_API_URL;
  const assistantId = import.meta.env.VITE_ASSISTANT_ID;
  const envApiKey = import.meta.env.VITE_LANGSMITH_API_KEY;
  const [businessId] = useQueryState("businessId");

  // For API key, use localStorage with env var fallback
  const [apiKey] = useState(() => {
    const storedKey = getApiKey();
    return storedKey || envApiKey || "";
  });

  // If we're missing any required env vars, show the form
  if (!apiUrl || !assistantId) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full p-4">
        <div className="animate-in fade-in-0 zoom-in-95 flex flex-col border bg-background shadow-lg rounded-lg max-w-3xl">
          <div className="flex flex-col gap-2 mt-14 p-6 border-b">
            <div className="flex items-start flex-col gap-2">
              <MarkyLogoSVG className="h-7" />
              <h1 className="text-xl font-semibold tracking-tight">
                Configuration Required
              </h1>
            </div>
            <p className="text-muted-foreground">
              The required environment variables are not configured:
              <ul className="list-disc list-inside mt-2">
                <li>VITE_API_URL</li>
                <li>VITE_ASSISTANT_ID</li>
                <li>VITE_LANGSMITH_API_KEY</li>
              </ul>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StreamSession
      apiKey={apiKey}
      apiUrl={apiUrl}
      assistantId={assistantId}
      businessId={businessId ?? ""}
    >
      {children}
    </StreamSession>
  );
};

// Create a custom hook to use the context
export const useStreamContext = (): StreamContextType => {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
};

export default StreamContext;
