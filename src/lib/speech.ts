type SpeakOptions = {
  rate?: number;
  pitch?: number;
};

let preferredVoice: SpeechSynthesisVoice | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return preferredVoice;

  preferredVoice =
    voices.find(
      (v) =>
        /en(-|_)?(US|GB|IN)?/i.test(v.lang) &&
        /female|samantha|google uk english female|zira|karen/i.test(v.name)
    ) ||
    voices.find((v) => v.lang.toLowerCase().startsWith("en")) ||
    voices[0] ||
    null;

  return preferredVoice;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeaking(): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
}

export type SpeakResult = "ended" | "failed" | "skipped";

export function speak(text: string, options: SpeakOptions = {}): Promise<SpeakResult> {
  return new Promise((resolve) => {
    if (!canSpeak() || !text.trim()) {
      resolve("skipped");
      return;
    }

    const synth = window.speechSynthesis;
    try {
      synth.resume();
    } catch {
      // ignore
    }

    const utter = new SpeechSynthesisUtterance(text.trim());
    // Keep a reference so Chrome does not garbage-collect the utterance mid-speech.
    currentUtterance = utter;
    utter.rate = options.rate ?? 1;
    utter.pitch = options.pitch ?? 1.05;
    const voice = pickVoice();
    if (voice) utter.voice = voice;

    let settled = false;
    let retries = 0;
    let result: SpeakResult = "failed";
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(watchdog);
      resolve(result);
    };

    const watchdog = window.setTimeout(finish, 20_000);

    const startNow = () => {
      if (currentUtterance !== utter || settled) return;
      const late = pickVoice();
      if (late) utter.voice = late;
      try {
        synth.resume();
      } catch {
        // ignore
      }
      synth.speak(utter);
    };

    utter.onend = () => {
      if (currentUtterance === utter) currentUtterance = null;
      result = "ended";
      finish();
    };
    utter.onerror = (event) => {
      // A newer nudge owns the speaker. This line was replaced on purpose.
      if (currentUtterance !== utter) {
        finish();
        return;
      }
      // Chrome fires these when cancel() lands on the utterance we just started.
      if (event.error === "interrupted" || event.error === "canceled") {
        finish();
        return;
      }
      if (retries < 1 && event.error === "not-allowed") {
        retries += 1;
        window.setTimeout(startNow, 0);
        return;
      }
      finish();
    };

    if (!synth.getVoices().length) {
      const onVoices = () => {
        synth.removeEventListener("voiceschanged", onVoices);
        if (currentUtterance === utter && !settled && !synth.speaking && !synth.pending) {
          startNow();
        }
      };
      synth.addEventListener("voiceschanged", onVoices);
    }

    const replacing = synth.speaking || synth.pending;
    if (replacing) {
      try {
        synth.cancel();
      } catch {
        // ignore
      }
      // Speaking in the same turn as cancel() makes Chrome drop the new line.
      window.setTimeout(startNow, 0);
      return;
    }

    // Speak in this turn so Nudge me still counts as the user gesture.
    startNow();
  });
}

export function buildGreeting(name: string, openTasks: string[]): string {
  const first = name.trim() || "friend";
  if (openTasks.length === 0) {
    return `Hey ${first}. Ready when you are — add a few outcomes for today and I’ll keep you moving.`;
  }
  if (openTasks.length === 1) {
    return `Hey ${first}, can you please work on ${openTasks[0]}? That’s your top focus for today.`;
  }
  const [top, ...rest] = openTasks;
  const more = rest.length;
  return `Hey ${first}, can you please work on ${top}? You’ve also got ${more} more open ${more === 1 ? "task" : "tasks"} today — I’ve got your back.`;
}

export function buildReminderLine(name: string, taskTitle: string): string {
  const first = name.trim() || "friend";
  return `Hey ${first}, gentle reminder — can you please work on ${taskTitle} now?`;
}

export function buildNudge(name: string, taskTitle: string): string {
  const first = name.trim() || "friend";
  return `${first}, let’s tackle ${taskTitle} next. You’ve got this.`;
}

export function buildProjectReminderLine(
  name: string,
  projectName: string,
  openCount: number,
  topTitle: string
): string {
  const first = name.trim() || "friend";
  if (openCount <= 1) {
    return `Hey ${first}, ${projectName} needs you. Can you please work on ${topTitle}?`;
  }
  const more = openCount - 1;
  return `Hey ${first}, ${projectName} still has open work. Start with ${topTitle}. ${more} more ${more === 1 ? "task is" : "tasks are"} waiting on that project.`;
}

export function buildDoneGreeting(name: string): string {
  const first = name.trim() || "friend";
  return `Hey ${first}. You’re clear for today. I’ll speak up when there’s something new to move.`;
}

export function buildEmptyNudge(name: string): string {
  const first = name.trim() || "friend";
  return `Hey ${first}, add a focus task for today and I’ll nudge you on it.`;
}
