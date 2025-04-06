import { getApiKey } from "@/lib/api-key";
import { Thread } from "@langchain/langgraph-sdk";
import { useQueryState } from "nuqs";
import {
    ReactNode,
    useCallback,
    useState,
} from "react";
import { createClient } from "../client";
import { ThreadContext } from "./context";
import { getThreadSearchMetadata } from "./utils";

export function ThreadProvider({ children }: { children: ReactNode }) {
  const [apiUrl] = useQueryState("apiUrl");
  const [assistantId] = useQueryState("assistantId");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);

  const getThreads = useCallback(async (): Promise<Thread[]> => {
    if (!apiUrl || !assistantId) return [];
    const client = createClient(apiUrl, getApiKey() ?? undefined);

    const threads = await client.threads.search({
      metadata: {
        ...getThreadSearchMetadata(assistantId),
      },
      limit: 100,
    });

    return threads;
  }, [apiUrl, assistantId]);

  const value = {
    getThreads,
    threads,
    setThreads,
    threadsLoading,
    setThreadsLoading,
  };

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
} 