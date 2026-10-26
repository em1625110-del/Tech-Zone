import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import useShop from "../hooks/useShop";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import CatAssistant from "../components/CatAssistant";
import { Zap } from "lucide-react";

export default function StoreLayout() {
  const { dark, t } = useShop();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  }, [location]);

  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      <div className="announcement">
        <Zap size={14} />
        {t.announcement}
      </div>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
      <CatAssistant />
    </div>
  );
}
