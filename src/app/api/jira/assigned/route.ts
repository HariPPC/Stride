import { fetchAssignedFromJira, snapshotPayload } from "@/lib/jira-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = process.env.JIRA_EMAIL?.trim();
  const apiToken = process.env.JIRA_API_TOKEN?.trim();
  if (email && apiToken) {
    try {
      const payload = await fetchAssignedFromJira(email, apiToken);
      return Response.json(payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not reach Jira.";
      return Response.json({ error: message }, { status: 502 });
    }
  }

  return Response.json(snapshotPayload());
}

export async function POST(request: Request) {
  let body: { email?: unknown; apiToken?: unknown };
  try {
    body = (await request.json()) as { email?: unknown; apiToken?: unknown };
  } catch {
    return Response.json({ error: "Send an email and API token." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const apiToken = typeof body.apiToken === "string" ? body.apiToken.trim() : "";
  if (!email || !email.includes("@") || apiToken.length < 8) {
    return Response.json(
      { error: "Enter the Atlassian email and API token for your account." },
      { status: 400 }
    );
  }

  try {
    const payload = await fetchAssignedFromJira(email, apiToken);
    return Response.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not reach Jira.";
    const status = message.includes("rejected") ? 401 : 502;
    return Response.json({ error: message }, { status });
  }
}
