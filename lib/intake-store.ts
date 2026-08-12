import type { IntakeFields } from "@/lib/intake";

export function intakeStoreConfigured(): boolean {
  return Boolean(process.env.INTAKE_WEBHOOK_URL || process.env.INTAKE_DIR);
}

function assertSafeDir(dir: string): string {
  if (!dir.startsWith("/") || dir.includes("\0") || dir.includes("..")) {
    throw new Error("unsafe_intake_dir");
  }
  return dir;
}

export async function persistIntake(
  data: IntakeFields,
): Promise<{ stored: boolean; id: string }> {
  const id = crypto.randomUUID();
  const webhook = process.env.INTAKE_WEBHOOK_URL;
  if (webhook) {
    const url = new URL(webhook);
    if (url.protocol !== "https:") {
      return { stored: false, id };
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-intake-id": id,
        },
        body: JSON.stringify({
          id,
          name: data.name,
          email: data.email,
          company: data.company,
          message: data.message,
          receivedAt: new Date().toISOString(),
        }),
        signal: controller.signal,
      });
      return { stored: res.ok, id };
    } catch {
      return { stored: false, id };
    } finally {
      clearTimeout(timer);
    }
  }

  const dir = process.env.INTAKE_DIR;
  if (dir) {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const safe = assertSafeDir(dir);
    await mkdir(safe, { recursive: true });
    await writeFile(
      join(safe, `${id}.json`),
      JSON.stringify(
        {
          id,
          name: data.name,
          email: data.email,
          company: data.company,
          message: data.message,
          receivedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      { mode: 0o600 },
    );
    return { stored: true, id };
  }

  return { stored: false, id };
}
