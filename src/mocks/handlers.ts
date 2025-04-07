import { delay, http, HttpResponse } from "msw";

interface Thread {
  id: string;
  created_at: string;
  metadata: {
    title: string;
  };
}

interface Message {
  id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// Mock data
const threads: Thread[] = [
  {
    id: "thread_1",
    created_at: new Date().toISOString(),
    metadata: { title: "First Thread" },
  },
  {
    id: "thread_2",
    created_at: new Date().toISOString(),
    metadata: { title: "Second Thread" },
  },
];

const messages: Message[] = [
  {
    id: "msg_1",
    thread_id: "thread_1",
    role: "user",
    content: "Hello!",
    created_at: new Date().toISOString(),
  },
  {
    id: "msg_2",
    thread_id: "thread_1",
    role: "assistant",
    content: "Hi there! How can I help you today?",
    created_at: new Date().toISOString(),
  },
];

// Helper function to simulate streaming text
async function* streamText(text: string) {
  const chunks = text.split(" ");
  for (const chunk of chunks) {
    await delay(200); // Add a small delay between chunks
    yield chunk + " ";
  }
}

export const handlers = [
  // Get threads
  http.get("https://api.example.com/api/threads", () => {
    return HttpResponse.json(threads);
  }),

  // Get thread by ID
  http.get("https://api.example.com/api/threads/:threadId", ({ params }) => {
    const thread = threads.find((t) => t.id === params.threadId);
    if (!thread) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(thread);
  }),

  // Create thread
  http.post("https://api.example.com/api/threads", async () => {
    const now = new Date().toISOString();
    const threadId = crypto.randomUUID();

    return HttpResponse.json({
      thread_id: threadId,
      created_at: now,
      updated_at: now,
      metadata: {},
      status: "idle",
      config: {},
      values: null,
    });
  }),

  // Get messages for a thread
  http.get(
    "https://api.example.com/api/threads/:threadId/messages",
    ({ params }) => {
      const threadMessages = messages.filter(
        (m) => m.thread_id === params.threadId,
      );
      return HttpResponse.json(threadMessages);
    },
  ),

  // Create message with streaming response
  http.post(
    "https://api.example.com/api/threads/:threadId/messages",
    async ({ params, request }) => {
      const data = (await request.json()) as Pick<Message, "role" | "content">;

      // If it's a user message, just save and return it normally
      if (data.role === "user") {
        const newMessage: Message = {
          id: `msg_${messages.length + 1}`,
          thread_id: params.threadId as string,
          role: data.role,
          content: data.content,
          created_at: new Date().toISOString(),
        };
        messages.push(newMessage);
        return HttpResponse.json(newMessage);
      }

      // For assistant messages, stream the response
      const responseText = "hi there";

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamText(responseText)) {
              const data = `data: ${JSON.stringify({ content: chunk })}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      // Save the complete message
      const newMessage: Message = {
        id: `msg_${messages.length + 1}`,
        thread_id: params.threadId as string,
        role: "assistant",
        content: responseText,
        created_at: new Date().toISOString(),
      };
      messages.push(newMessage);

      return new HttpResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    },
  ),

  // Thread history endpoint
  http.post(
    "https://api.example.com/api/threads/:threadId/history",
    async ({ params, request }) => {
      const history = [
        {
          values: {
            messages: [
              {
                content: "hello",
                additional_kwargs: {},
                response_metadata: {},
                type: "human",
                name: null,
                id: "msg_1",
                example: false,
              },
              {
                content:
                  "Hello! How can I assist you with your graphic design needs today?",
                additional_kwargs: {},
                response_metadata: {
                  finish_reason: "stop",
                  model_name: "gpt-4o-2024-08-06",
                  system_fingerprint: "fp_de57b65c90",
                },
                type: "ai",
                name: null,
                id: "run-1",
                example: false,
                tool_calls: [],
                invalid_tool_calls: [],
                usage_metadata: null,
              },
            ],
          },
          next: [],
          tasks: [],
          metadata: {
            graph_id: "agent",
            assistant_id: "mock-assistant-id",
            step: 1,
            writes: {
              kayla: {
                messages: [
                  {
                    content: "hello",
                    type: "human",
                    id: "msg_1",
                  },
                  {
                    content:
                      "Hello! How can I assist you with your graphic design needs today?",
                    type: "ai",
                    id: "run-1",
                  },
                ],
              },
            },
          },
          created_at: new Date().toISOString(),
          checkpoint: {
            checkpoint_id: "mock-checkpoint-1",
            thread_id: params.threadId,
            checkpoint_ns: "",
          },
        },
      ];

      return HttpResponse.json(history);
    },
  ),

  // Info endpoint for graph status check
  http.get("https://api.example.com/api/info", () => {
    return HttpResponse.json({
      flags: {
        assistants: true,
        crons: false,
        langsmith: true,
      },
    });
  }),

  // Stream endpoint
  http.post("https://api.example.com/api/runs/stream", async ({ request }) => {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Simulate streaming response with messages
          const messages = [
            { type: "values", data: { content: "hi " } },
            { type: "values", data: { content: "there" } },
            { type: "messages-tuple", data: ["assistant", "hi there"] },
            { type: "custom", data: { type: "end" } },
          ];

          for (const message of messages) {
            await delay(200);
            const data = `data: ${JSON.stringify(message)}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new HttpResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }),

  // Thread run stream endpoint
  http.post(
    "https://api.example.com/api/threads/:threadId/runs/stream",
    async ({ request }) => {
      const data = (await request.json()) as { input: { messages: string } };
      const userMessage = data.input.messages;

      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Echo back the user's message in the streaming format
            const messages = [
              { type: "values", data: { content: userMessage } },
              { type: "messages-tuple", data: ["assistant", userMessage] },
              { type: "custom", data: { type: "end" } },
            ];

            for (const message of messages) {
              await delay(200);
              const data = `data: ${JSON.stringify(message)}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new HttpResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    },
  ),
];
