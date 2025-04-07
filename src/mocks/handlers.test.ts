import { describe, expect, it } from "vitest";

describe("Message Exchange", () => {
  // Increase timeout to 10 seconds
  it("should handle user message and stream assistant response", async () => {
    // Send user message
    const userResponse = await fetch(
      "https://api.example.com/api/threads/thread_1/messages",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          content: "hello",
        }),
      },
    );

    expect(userResponse.ok).toBe(true);
    const userMessage = await userResponse.json();
    expect(userMessage).toMatchObject({
      role: "user",
      content: "hello",
      thread_id: "thread_1",
    });

    // Send assistant message and test streaming
    const assistantResponse = await fetch(
      "https://api.example.com/api/threads/thread_1/messages",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "assistant",
          content: "hi there",
        }),
      },
    );

    expect(assistantResponse.ok).toBe(true);
    expect(assistantResponse.headers.get("Content-Type")).toBe(
      "text/event-stream",
    );

    // Read the stream
    const reader = assistantResponse.body?.getReader();
    const chunks: string[] = [];

    if (!reader) {
      throw new Error("No reader available");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      chunks.push(chunk);
    }

    // Verify that we received streaming chunks
    expect(chunks.length).toBeGreaterThan(0);

    // Each chunk should be in SSE format: data: {"content": "..."}\n\n
    const firstChunk = chunks[0];
    expect(firstChunk).toMatch(/^data: {"content":.*}\n\n$/);
  }, 10000); // 10 second timeout
});
