import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import useShop from "../hooks/useShop";

export default function SiteFooter() {
  const { t } = useShop();

  return (
    <footer className="footer" id="footer">
      <Link className="logo" to="/">
        <span className="logo-icon"><Zap size={21} /></span>
        <span>TECH<span className="logo-accent">-ZONE</span></span>
      </Link>
      <p>{t.footerTagline}</p>
      <span>© {new Date().getFullYear()} {t.footerCopy}</span>
    </footer>
  );
}
