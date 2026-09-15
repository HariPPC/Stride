"use client";

import type { ChatMessage } from "@/lib/knowledge/types";
import { AssistantBubble } from "./assistant-bubble";

type Props = {
  messages: ChatMessage[];
  thinking: boolean;
};

export function MessageList({ messages, thinking }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-5 py-4">
      {messages.map((m) =>
        m.role === "user" ? (
          <div key={m.id} className="animate-rise flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[color:var(--ink)] px-4 py-3 text-sm leading-relaxed text-[color:var(--foam)] shadow-[0_12px_30px_rgba(11,31,51,0.18)]">
              {m.text}
            </div>
          </div>
        ) : m.answer ? (
          <AssistantBubble key={m.id} answer={m.answer} />
        ) : null,
      )}

      {thinking && (
        <div className="animate-rise flex items-center gap-3 text-sm text-[color:var(--muted-ink)]">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[color:var(--accent)] opacity-40" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[color:var(--accent)]" />
          </span>
          Retrieving governed knowledge…
        </div>
      )}
    </div>
  );
}
