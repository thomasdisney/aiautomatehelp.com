import { AGENT_URL } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer-row">
        <div className="site-footer-brand">
          <p className="site-footer-name">Junk Drawer Agents</p>
          <p className="site-footer-tag">A coding agent on a computer you own. You approve every change.</p>
        </div>
        <nav className="site-footer-nav" aria-label="Site">
          <a href={`${AGENT_URL}/`}>Open the app</a>
          <a href="/help">Help</a>
          <a href={`${AGENT_URL}/legal`}>Legal</a>
        </nav>
      </div>
      <div className="site-footer-legal safe-pad-x safe-pad-bottom">
        <p className="wrap">
          © {new Date().getFullYear()} Forager Station Holdings LLC. Junk Drawer Agents is run by Forager Station
          Holdings LLC, a Nevada limited liability company.
        </p>
      </div>
    </footer>
  );
}
