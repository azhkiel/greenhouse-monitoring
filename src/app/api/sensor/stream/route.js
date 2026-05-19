import emitter from "@/lib/events";

export async function GET() {
  const encoder = new TextEncoder();
  let closed = false;

  const onNewData = (record) => {
    if (closed) return;
    try {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(record)}\n\n`));
    } catch {}
  };

  let controller;

  const heartbeat = setInterval(() => {
    if (closed) return;
    try {
      controller.enqueue(encoder.encode(`: heartbeat\n\n`));
    } catch {
      clearInterval(heartbeat);
    }
  }, 15000);

  emitter.on("new-data", onNewData);

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      c.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", ts: Date.now() })}\n\n`));
    },
    cancel() {
      closed = true;
      clearInterval(heartbeat);
      emitter.off("new-data", onNewData);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}