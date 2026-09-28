import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const greetingFilePath = path.join(os.homedir(), ".stride", "greeting.txt");

export async function POST(request: Request) {
  let text = "";
  try {
    const body = (await request.json()) as { text?: unknown };
    if (typeof body.text === "string") text = body.text;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  text = text.replace(/[\u0000-\u001F]+/g, " ").trim().slice(0, 500);
  await mkdir(path.dirname(greetingFilePath), { recursive: true });
  await writeFile(greetingFilePath, text, "utf8");
  return Response.json({ ok: true });
}
