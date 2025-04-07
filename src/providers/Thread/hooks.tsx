import { useContext } from "react";
import { ThreadContext, type ThreadContextType } from "./context";

export function useThreads(): ThreadContextType {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThreads must be used within a ThreadProvider");
  }
  return context;
}
