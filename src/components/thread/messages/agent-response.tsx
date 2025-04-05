import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useStreamContext } from "@/providers/Stream";
import { MarkdownText } from "../markdown-text";

interface AgentInfo {
  name: string;
  description: string;
}

const AGENT_INFO: Record<string, AgentInfo> = {
  manny: {
    name: "Manny",
    description: "Marketing expert focused on content strategy and campaign planning",
  },
  kayla: {
    name: "Kayla",
    description: "Creative specialist focused on visual design and brand storytelling",
  },
};

interface AgentResponse {
  current_agent: "manny" | "kayla";
  message: string;
  next_available_options: string[];
}

interface AgentResponseProps {
  response: AgentResponse;
}

function truncateWithEllipsis(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + "...";
}

export function AgentResponse({ response }: AgentResponseProps) {
  const stream = useStreamContext();
  const { current_agent, message, next_available_options } = response;

  const handleAgentSwitch = (agent: string) => {
    if (agent !== current_agent) {
      stream.submit(
        { messages: `transfer me to ${agent}` },
        { 
          streamMode: ["values"],
          optimisticValues: (prev) => ({
            ...prev,
            messages: [...(prev.messages ?? []), { type: "human", content: `transfer me to ${agent}` }],
          }),
        }
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl">
      {/* Message Content */}
      <div className="text-left px-4 py-2 rounded-lg bg-background">
        <MarkdownText>
          {message}
        </MarkdownText>
      </div>

      {/* Action Options */}
      <div className="flex flex-wrap gap-2">
        {next_available_options.map((option, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="text-left"
                  onClick={() => {
                    stream.submit(
                      { messages: option },
                      { 
                        streamMode: ["values"],
                        optimisticValues: (prev) => ({
                          ...prev,
                          messages: [...(prev.messages ?? []), { type: "human", content: option }],
                        }),
                      }
                    );
                  }}
                >
                  {truncateWithEllipsis(option, 50)}
                </Button>
              </TooltipTrigger>
              {option.length > 50 && (
                <TooltipContent>
                  <p>{option}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Agent Switcher */}
      <div className="flex gap-2 justify-end">
        {Object.entries(AGENT_INFO).map(([agentId, info]) => (
          <TooltipProvider key={agentId}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={current_agent === agentId ? "default" : "outline"}
                  className={cn(
                    "transition-all",
                    current_agent === agentId && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handleAgentSwitch(agentId)}
                >
                  {info.name}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{info.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
} 