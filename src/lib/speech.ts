type SpeakOptions = {
  rate?: number;
  pitch?: number;
};

let preferredVoice: SpeechSynthesisVoice | null = null;

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

    // Chrome can get stuck mid-utterance; clear before starting.
    stopSpeaking();

    const utter = new SpeechSynthesisUtterance(text.trim());
    utter.rate = options.rate ?? 1;
    utter.pitch = options.pitch ?? 1.05;
    const voice = pickVoice();
    if (voice) utter.voice = voice;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(watchdog);
      resolve();
    };

    // Never leave callers hanging if the browser drops speech events.
    const watchdog = window.setTimeout(finish, 12_000);

    utter.onend = finish;
    utter.onerror = finish;

    const start = () => {
      const late = pickVoice();
      if (late) utter.voice = late;
      window.speechSynthesis.speak(utter);
      // Chrome bug: speech sometimes stays paused until resume().
      window.setTimeout(() => {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch {
          // ignore
        }
      }, 50);
    };

    if (!window.speechSynthesis.getVoices().length) {
      const onVoices = () => {
        window.speechSynthesis.onvoiceschanged = null;
        start();
      };
      window.speechSynthesis.onvoiceschanged = onVoices;
      window.setTimeout(() => {
        if (!settled && !window.speechSynthesis.speaking) {
          start();
        }
      }, 300);
      return;
    }

    start();
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

export function buildEmptyNudge(name: string): string {
  const first = name.trim() || "friend";
  return `Hey ${first}, add a focus task for today and I’ll nudge you on it.`;
}
