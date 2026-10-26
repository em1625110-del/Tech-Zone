import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, ClipboardList, LogOut, UserRound } from "lucide-react";
import useAuth from "../hooks/useAuth";
import useShop from "../hooks/useShop";
import { db } from "../firebase";
import { formatPrice } from "../utils/products";

function formatDate(timestamp, lang) {
  if (!timestamp?.toDate) return "—";
  const locale = { ru: "ru-RU", ky: "ky-KG", en: "en-US" }[lang] || "ru-RU";
  return timestamp.toDate().toLocaleString(locale);
}

export default function AccountPage() {
  const { logout, user, authLoading } = useAuth();
  const { lang, t } = useShop();
  const a = t.account;
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [ordersError, setOrdersError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const loading = Boolean(user && db && loadedUserId !== user.uid);

  useEffect(() => {
    if (!user || !db) return undefined;
    let profileLoaded = false;
    let ordersLoaded = false;
    const updateLoadedState = () => {
      if (profileLoaded && ordersLoaded) setLoadedUserId(user.uid);
    };
    const unsubscribeProfile = onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        setProfile(snapshot.exists() ? snapshot.data() : null);
        profileLoaded = true;
        setProfileError("");
        updateLoadedState();
      },
      (snapshotError) => {
        setProfileError(a.profileLoadError.replace("{error}", snapshotError.message));
        profileLoaded = true;
        updateLoadedState();
      },
    );
    const unsubscribeOrders = onSnapshot(
      query(collection(db, "orders"), where("userId", "==", user.uid)),
      (snapshot) => {
        setOrders(
          snapshot.docs
            .map((item) => ({ ...item.data(), id: item.id }))
            .sort((left, right) => (right.createdAt?.toMillis?.() || 0) - (left.createdAt?.toMillis?.() || 0)),
        );
        ordersLoaded = true;
        setOrdersError("");
        updateLoadedState();
      },
      (snapshotError) => {
        setOrdersError(a.ordersLoadError.replace("{error}", snapshotError.message));
        ordersLoaded = true;
        updateLoadedState();
      },
    );

    return () => {
      unsubscribeProfile();
      unsubscribeOrders();
    };
  }, [user, a.ordersLoadError, a.profileLoadError]);

  if (authLoading) return <main className="section"><p>{a.loading}</p></main>;
  if (!user) return <Navigate to="/auth" replace />;

  const createdAt = profile?.createdAt || (user.metadata.creationTime
    ? { toDate: () => new Date(user.metadata.creationTime) }
    : null);

  async function handleLogout() {
    setLogoutError("");
    try {
      await logout();
    } catch (logoutFailure) {
      setLogoutError(a.logoutError.replace("{error}", logoutFailure.message));
    }
  }

  return (
    <main className="section account-page">
      <header className="account-page-header">
        <div>
          <span className="eyebrow">{a.eyebrow}</span>
          <h1>{a.title}</h1>
        </div>
        <Link className="secondary-button account-back-link" to="/">
          <ArrowLeft size={16} />{a.backToStore}
        </Link>
      </header>

      {profileError && <p className="admin-error">{profileError}</p>}
      {ordersError && <p className="admin-error">{ordersError}</p>}
      {!db && <p className="admin-error">{a.firebaseUnavailable}</p>}
      {logoutError && <p className="admin-error">{logoutError}</p>}

      <div className="account-layout">
        <section className="account-card account-profile-card">
          <h2><UserRound size={19} />{a.profileTitle}</h2>
          <div className="account-profile-fields">
            <div><span>{a.name}</span><strong>{profile?.displayName || user.displayName || "—"}</strong></div>
            <div><span>{a.email}</span><strong>{profile?.email || user.email || "—"}</strong></div>
            <div><span>{a.memberSince}</span><strong>{formatDate(createdAt, lang)}</strong></div>
            <div><span>{a.accountId}</span><code>{user.uid}</code></div>
          </div>
          <button className="secondary-button account-logout-button" onClick={handleLogout}>
            <LogOut size={16} />{a.logout}
          </button>
        </section>

        <section className="account-card account-orders-card">
          <header className="account-orders-heading">
            <h2><ClipboardList size={19} />{a.ordersTitle}</h2>
            <span>{orders.length}</span>
          </header>
          {loading ? (
            <p className="account-muted">{a.loading}</p>
          ) : orders.length === 0 ? (
            <div className="account-empty-orders">
              <p>{a.noOrders}</p>
              <Link className="primary-button" to="/catalog">{a.browseCatalog}</Link>
            </div>
          ) : (
            <div className="account-order-list">
              {orders.map((order) => (
                <article className="account-order" key={order.id}>
                  <header>
                    <div><span>{a.orderNumber}</span><strong>#{order.id.slice(0, 8)}</strong></div>
                    <span className={`account-order-status status-${order.status || "new"}`}>
                      {t.admin[order.status] || t.admin.new}
                    </span>
                  </header>
                  <p className="account-order-date">{formatDate(order.createdAt, lang)}</p>
                  <ul>
                    {(order.items || []).map((item, index) => (
                      <li key={`${item.productId || item.title}-${index}`}>
                        <span>{item.title} × {item.quantity}</span>
                        <strong>{formatPrice(Number(item.price) * Number(item.quantity))}</strong>
                      </li>
                    ))}
                  </ul>
                  <div className="account-order-details">
                    <span>{a.deliveryAddress}: {order.address || "—"}</span>
                    <span>{t.admin.phone}: {order.phone || "—"}</span>
                    <span>{a.paymentMethod}: {order.paymentMethod === "cash" ? t.cashPayment : order.paymentMethod || "—"}</span>
                  </div>
                  <footer><span>{a.orderTotal}</span><strong>{formatPrice(Number(order.total) || 0)}</strong></footer>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
