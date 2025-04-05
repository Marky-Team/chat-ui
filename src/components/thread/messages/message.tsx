import { cn } from "@/lib/utils";
import { type Message } from "@langchain/langgraph-sdk";
import { MarkdownText } from "../markdown-text";
import { AgentResponse } from "./agent-response";

interface MessageProps {
  message: Message;
  isLastMessage?: boolean;
}

export function Message({ message, isLastMessage }: MessageProps) {
  const isHuman = message.type === "human";
  const content = message.content;

  // Try to parse content as JSON for agent responses
  if (!isHuman && typeof content === "string") {
    try {
      const parsedContent = JSON.parse(content);
      if (
        parsedContent &&
        typeof parsedContent === "object" &&
        "current_agent" in parsedContent &&
        "message" in parsedContent &&
        "next_available_options" in parsedContent
      ) {
        return <AgentResponse response={parsedContent} />;
      }
    } catch (e) {
      // Not a JSON response, continue with normal rendering
    }
  }

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 px-4",
        isHuman && "justify-end"
      )}
    >
      <div
        className={cn(
          "flex w-full max-w-3xl flex-col gap-2 rounded-lg px-4 py-2 text-left",
          isHuman
            ? "bg-primary text-primary-foreground"
            : "bg-background"
        )}
      >
        <MarkdownText>
          {typeof content === "string" ? content : JSON.stringify(content)}
        </MarkdownText>
      </div>
    </div>
  );
} 