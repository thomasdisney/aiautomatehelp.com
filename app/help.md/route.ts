import { HELP_MD } from "@/lib/help-content";

export const dynamic = "force-static";

export function GET() {
  return new Response(HELP_MD, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
