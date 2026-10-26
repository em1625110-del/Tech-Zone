import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Globe,
  Heart,
  Menu,
  Moon,
  ShoppingCart,
  Sun,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import useShop from "../hooks/useShop";
import useAuth from "../hooks/useAuth";

const LANGUAGES = [
  { code: "ru", label: "RU", full: "Русский" },
  { code: "ky", label: "KY", full: "Кыргызча" },
  { code: "en", label: "EN", full: "English" },
];

function LanguageSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div className="lang-switcher" ref={ref}>
      <button className="lang-trigger" onClick={() => setOpen((value) => !value)} aria-label="Выбрать язык">
        <Globe size={16} />
        <span>{LANGUAGES.find((item) => item.code === lang)?.label}</span>
      </button>
      {open && (
        <div className="lang-dropdown">
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              className={`lang-option ${lang === item.code ? "active" : ""}`}
              onClick={() => {
                setLang(item.code);
                setOpen(false);
              }}
            >
              <span className="lang-code">{item.label}</span>
              <span className="lang-full">{item.full}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const { cart, dark, favorites, lang, setDark, setLang, t } = useShop();
  const { isAdmin, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="header">
      <Link className="logo" to="/">
        <span className="logo-icon"><Zap size={23} /></span>
        <span>TECH<span className="logo-accent">-ZONE</span></span>
      </Link>
      <nav className={`nav ${menuOpen ? "nav-open" : ""}`}>
        <NavLink to="/" end onClick={() => setMenuOpen(false)}>{t.navHome}</NavLink>
        <NavLink to="/catalog" onClick={() => setMenuOpen(false)}>{t.navCatalog}</NavLink>
        <Link to="/#advantages" onClick={() => setMenuOpen(false)}>{t.navAdvantages}</Link>
        <Link to="/#reviews" onClick={() => setMenuOpen(false)}>{t.navReviews}</Link>
        <Link to="/#footer" onClick={() => setMenuOpen(false)}>{t.navContacts}</Link>
      </nav>
      <div className="header-actions">
        <LanguageSwitcher lang={lang} setLang={setLang} />
        <button className="icon-button theme-button" onClick={() => setDark(!dark)} aria-label="Переключить тему" title="Переключить тему">
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <Link className="icon-button favorite-button" to="/favorites" aria-label="Избранное" title="Избранное">
          <Heart size={19} />
          {favorites.length > 0 && <span>{favorites.length}</span>}
        </Link>
        <Link className="header-account" to={isAdmin ? "/admin" : user ? "/account" : "/auth"}>
          <UserRound size={16} aria-hidden="true" />
          {isAdmin ? t.admin.adminLink : user ? t.admin.accountLink : t.admin.signIn}
        </Link>
        <Link className="cart-button" to="/cart">
          <ShoppingCart size={18} />
          <span>{t.navCatalog === "Каталог" ? "Корзина" : t.cartTitle}</span>
          <b>{cartCount}</b>
        </Link>
        <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Открыть меню">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}
