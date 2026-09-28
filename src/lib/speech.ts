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

export function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!canSpeak() || !text.trim()) {
      resolve();
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
    let retried = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(watchdog);
      resolve();
    };

    const watchdog = window.setTimeout(finish, 15_000);
    utter.onend = () => {
      if (currentUtterance === utter) currentUtterance = null;
      finish();
    };
    utter.onerror = (event) => {
      // Chrome drops an utterance that starts in the same turn as cancel().
      if (
        !retried &&
        (event.error === "interrupted" ||
          event.error === "canceled" ||
          event.error === "not-allowed")
      ) {
        retried = true;
        window.setTimeout(() => {
          if (settled) return;
          try {
            synth.resume();
          } catch {
            // ignore
          }
          synth.speak(utter);
        }, 60);
        return;
      }
      finish();
    };

    const startNow = () => {
      const late = pickVoice();
      if (late) utter.voice = late;
      try {
        synth.resume();
      } catch {
        // ignore
      }
      // Speak in this turn so a button click still counts as the user gesture.
      synth.speak(utter);
    };

    if (synth.speaking || synth.pending) {
      synth.cancel();
      window.setTimeout(startNow, 60);
      return;
    }

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

export function buildEmptyNudge(name: string): string {
  const first = name.trim() || "friend";
  return `Hey ${first}, add a focus task for today and I’ll nudge you on it.`;
}
