import { Link } from "react-router-dom";
import {
  Heart,
  ShieldCheck,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import useShop from "../hooks/useShop";
import Catalog from "../components/Catalog";
import Reviews from "../components/Reviews";

export default function HomePage() {
  const { t } = useShop();

  return (
    <main>
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-label"><span />{t.heroLabel}</div>
          <h1>{t.heroTitle1}<br />{t.heroTitle2} <span>{t.heroTitleAccent}</span></h1>
          <p>{t.heroDesc}</p>
          <Link className="primary-button" to="/catalog">{t.heroCta} <span aria-hidden="true">→</span></Link>
          <div className="hero-trust">
            <div><ShieldCheck size={17} />{t.heroGuarantee}</div>
            <div><Truck size={17} />{t.heroDelivery}</div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-glow" />
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85" alt="Современный смартфон" />
          <div className="floating-card">
            <span className="floating-icon"><Zap size={20} /></span>
            <div><b>{t.floatingCardTitle}</b><small>{t.floatingCardSub}</small></div>
          </div>
          <div className="hero-tag"><Star size={15} fill="currentColor" />{t.heroTag}</div>
        </div>
      </section>

      <section className="advantages" id="advantages">
        <div><span><Truck size={22} /></span><div><b>{t.advDeliveryTitle}</b><small>{t.advDeliverySub}</small></div></div>
        <div><span><ShieldCheck size={22} /></span><div><b>{t.advGuaranteeTitle}</b><small>{t.advGuaranteeSub}</small></div></div>
        <div><span><Zap size={22} /></span><div><b>{t.advModernTitle}</b><small>{t.advModernSub}</small></div></div>
        <div><span><Heart size={22} /></span><div><b>{t.advForAllTitle}</b><small>{t.advForAllSub}</small></div></div>
      </section>

      <Catalog />
      <Reviews />
    </main>
  );
}
