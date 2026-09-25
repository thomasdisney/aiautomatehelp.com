import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiMethodGuard } from "@/lib/api-method";

export function middleware(request: NextRequest) {
  const guard = apiMethodGuard(request.nextUrl.pathname, request.method);
  if (!guard) return NextResponse.next();
  if (guard.status === 204) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "cache-control": "no-store",
        allow: guard.allow ?? "",
      },
    });
  }
  if (guard.status === 404) {
    return NextResponse.json(
      { ok: false, code: "not_found" },
      {
        status: 404,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }
  return NextResponse.json(
    { ok: false, code: "method" },
    {
      status: 405,
      headers: {
        "cache-control": "no-store",
        allow: guard.allow ?? "",
      },
    },
  );
}

export const config = {
  matcher: "/api/:path*",
};
