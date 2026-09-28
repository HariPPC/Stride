export async function publishStartupGreeting(text: string): Promise<void> {
  try {
    await fetch("/api/greeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    // The page still speaks if the login file cannot be saved.
  }
}
