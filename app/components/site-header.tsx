import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header safe-pad-top">
      <div className="wrap site-header-row">
        <Link href="/" className="brand" aria-label="notjunk.si, home">
          <span className="tape tape-brand">notjunk.si</span>
        </Link>
        <nav aria-label="Main" className="site-header-nav">
          <Link href="/help">Help</Link>
        </nav>
      </div>
    </header>
  );
}
