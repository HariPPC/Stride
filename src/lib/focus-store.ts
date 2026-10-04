import { EMPTY_FOCUS } from "@/lib/focus";
import { loadFocus, saveFocus } from "@/lib/storage";
import { STORAGE_KEYS, type FocusState } from "@/lib/types";

const CHANGE_EVENT = "stride-focus-change";

let cachedRaw: string | null = null;
let cachedState: FocusState = EMPTY_FOCUS;

function remember(raw: string | null, state: FocusState): FocusState {
  cachedRaw = raw;
  cachedState = state;
  return cachedState;
}

export function subscribeFocus(onChange: () => void): () => void {
  const notify = () => onChange();
  window.addEventListener(CHANGE_EVENT, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(CHANGE_EVENT, notify);
    window.removeEventListener("storage", notify);
  };
}

export function getFocusSnapshot(): FocusState {
  const raw = window.localStorage.getItem(STORAGE_KEYS.focus);
  if (raw === cachedRaw) return cachedState;
  return remember(raw, loadFocus());
}

export function getFocusServerSnapshot(): FocusState {
  return EMPTY_FOCUS;
}

export function updateFocus(recipe: (prev: FocusState) => FocusState): FocusState {
  const next = recipe(getFocusSnapshot());
  saveFocus(next);
  const raw = window.localStorage.getItem(STORAGE_KEYS.focus);
  remember(raw, next);
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return next;
}
