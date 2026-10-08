import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiMethodGuard, apiRewritePath } from "@/lib/api-method";
import { canonicalHostRedirect, repeatedSlashRedirect } from "@/lib/canonical-host";
import { SITE_ALIAS_HOSTS, SITE_HOST } from "@/lib/site-config";

const HOSTS = { canonicalHost: SITE_HOST, aliasHosts: SITE_ALIAS_HOSTS };

export function middleware(request: NextRequest) {
  const canonical = canonicalHostRedirect(request.headers.get("host"), request.nextUrl, HOSTS);
  if (canonical) {
    const redirect = NextResponse.redirect(canonical, 308);
    redirect.headers.set("cache-control", "no-store");
    return redirect;
  }
  const slash = repeatedSlashRedirect(request.nextUrl);
  if (slash) {
    const redirect = NextResponse.redirect(slash);
    redirect.headers.set("cache-control", "no-store");
    return redirect;
  }
  const pathname = request.nextUrl.pathname;
  const guard = apiMethodGuard(pathname, request.method);
  if (!guard) {
    const rewritePath = apiRewritePath(pathname);
    if (rewritePath) {
      const url = request.nextUrl.clone();
      url.pathname = rewritePath;
      const rewrite = NextResponse.rewrite(url);
      rewrite.headers.set("cache-control", "no-store");
      return rewrite;
    }
    return NextResponse.next();
  }
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
  matcher: ["/((?!_next/static|_next/image).*)", "/api/:path*"],
};
