"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { answerQuestion } from "@/lib/knowledge/engine";
import { journeys, roleLenses, starterPrompts } from "@/lib/knowledge/prompts";
import type {
  ChatMessage,
  JourneyId,
  RoleLens,
} from "@/lib/knowledge/types";
import { ChatComposer } from "./chat-composer";
import { EmptyHero } from "./empty-hero";
import { MessageList } from "./message-list";
import { SessionChrome } from "./session-chrome";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function KnowledgeAgentApp() {
  const [journey, setJourney] = useState<JourneyId>("checkout");
  const [lens, setLens] = useState<RoleLens>("business");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || thinking) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      text: trimmed,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setThinking(true);

    window.setTimeout(() => {
      startTransition(() => {
        const answer = answerQuestion(trimmed, journey, lens);
        const assistantMsg: ChatMessage = {
          id: uid(),
          role: "assistant",
          answer,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setThinking(false);
      });
    }, 700);
  }

  function resetChat() {
    setMessages([]);
    setDraft("");
    setThinking(false);
  }

  const hasChat = messages.length > 0;

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mesh-grid absolute inset-0 opacity-[0.35]" />
        <div className="absolute -left-24 top-[-10%] h-[55vh] w-[55vw] rounded-full bg-[radial-gradient(circle,rgba(56,134,168,0.28),transparent_68%)] blur-2xl motion-orb" />
        <div className="absolute right-[-15%] top-[8%] h-[48vh] w-[42vw] rounded-full bg-[radial-gradient(circle,rgba(232,109,74,0.18),transparent_70%)] blur-2xl motion-orb-delay" />
        <div className="absolute bottom-[-20%] left-[20%] h-[50vh] w-[60vw] rounded-full bg-[radial-gradient(circle,rgba(20,48,72,0.12),transparent_65%)] blur-3xl" />
      </div>

      <SessionChrome
        journey={journey}
        onJourneyChange={(id) => {
          setJourney(id);
          resetChat();
        }}
        lens={lens}
        onLensChange={setLens}
        journeys={journeys}
        roleLenses={roleLenses}
        hasChat={hasChat}
        onReset={resetChat}
      />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-4 pt-2 sm:px-6">
        {!hasChat ? (
          <EmptyHero
            onPrompt={(p) => ask(p)}
            prompts={starterPrompts}
            journeyLabel={journeys.find((j) => j.id === journey)?.label ?? "Checkout"}
          />
        ) : (
          <MessageList messages={messages} thinking={thinking} />
        )}
        <div ref={endRef} />
      </main>

      <ChatComposer
        value={draft}
        onChange={setDraft}
        onSubmit={() => ask(draft)}
        disabled={thinking}
        journeyLabel={journeys.find((j) => j.id === journey)?.label ?? "Checkout"}
        lensLabel={roleLenses.find((r) => r.id === lens)?.label ?? "Business"}
      />
    </div>
  );
}
