import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { collection, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import useAuth from "../hooks/useAuth";
import useShop from "../hooks/useShop";
import { isElectronicProduct } from "../utils/products";

const CATEGORY_OPTIONS = [
  { value: "smartphones", labelKey: "smartphones" },
  { value: "laptops", labelKey: "laptops" },
  { value: "tablets", labelKey: "tablets" },
  { value: "mobile-accessories", labelKey: "accessories" },
  { value: "mens-watches", labelKey: "mensWatches" },
  { value: "womens-watches", labelKey: "womensWatches" },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  price: "",
  category: "smartphones",
  thumbnail: "",
  stock: "",
  rating: "5",
  discountPercentage: "",
};

const SECTIONS = [
  { id: "overview", labelKey: "overview", icon: LayoutDashboard },
  { id: "products", labelKey: "products", icon: Package },
  { id: "orders", labelKey: "orders", icon: ClipboardList },
  { id: "users", labelKey: "users", icon: Users },
];

const ORDER_STATUSES = ["new", "processing", "completed", "cancelled"];

function formatDate(timestamp, lang) {
  if (!timestamp?.toDate) return "—";
  const locale = { ru: "ru-RU", ky: "ky-KG", en: "en-US" }[lang] || "ru-RU";
  return timestamp.toDate().toLocaleString(locale);
}

export default function AdminPanel({ onAddProduct, inventoryProducts, onDeleteProduct }) {
  const { logout, user } = useAuth();
  const { lang, setLang, t } = useShop();
  const a = t.admin;
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!addProductOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape" && !busy) setAddProductOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [addProductOpen, busy]);

  useEffect(() => {
    if (!db) return undefined;
    const unsubscribeOrders = onSnapshot(
      collection(db, "orders"),
      (snapshot) => setOrders(
        snapshot.docs
          .map((item) => ({ ...item.data(), id: item.id }))
          .sort((left, right) => (right.createdAt?.toMillis?.() || 0) - (left.createdAt?.toMillis?.() || 0)),
      ),
      (error) => setActionError(a.ordersLoadError.replace("{error}", error.message)),
    );
    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => setUsers(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }))),
      (error) => setActionError(a.usersLoadError.replace("{error}", error.message)),
    );
    return () => {
      unsubscribeOrders();
      unsubscribeUsers();
    };
  }, [a.ordersLoadError, a.usersLoadError]);

  const visibleProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return inventoryProducts;
    return inventoryProducts.filter((product) =>
      `${product.title} ${product.category}`.toLowerCase().includes(query),
    );
  }, [inventoryProducts, productSearch]);
  const nonElectronicProducts = useMemo(
    () => inventoryProducts.filter((product) => product.isCustom && !isElectronicProduct(product)),
    [inventoryProducts],
  );

  const revenue = useMemo(
    () => orders.reduce((total, order) => total + (Number(order.total) || 0), 0),
    [orders],
  );

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFormError("");
    if (!file.type.startsWith("image/")) {
      setFormError(a.imageOnly);
      event.target.value = "";
      return;
    }
    if (file.size > 700 * 1024) {
      setFormError(a.imageTooLarge);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, thumbnail: String(reader.result) }));
    reader.onerror = () => setFormError(a.imageReadError);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");
    if (!form.title.trim()) return setFormError(a.titleRequired);
    if (!form.price || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      return setFormError(a.priceInvalid);
    }
    if (!form.thumbnail) return setFormError(a.imageRequired);

    setBusy(true);
    try {
      await onAddProduct({
        title: form.title.trim(),
        description: form.description.trim() || a.productAddedByAdmin,
        price: Number(form.price),
        category: form.category,
        thumbnail: form.thumbnail,
        stock: Number(form.stock) || 99,
        rating: Number(form.rating) || 5,
        discountPercentage: Number(form.discountPercentage) || 0,
      });
      setForm(EMPTY_FORM);
      setSuccessMessage(a.saved);
      setAddProductOpen(false);
    } catch (error) {
      setFormError(a.saveError.replace("{error}", error.message));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteProduct(productId) {
    setActionError("");
    try {
      await onDeleteProduct(productId);
    } catch (error) {
      setActionError(a.deleteError.replace("{error}", error.message));
    }
  }

  async function handleCleanupNonElectronic() {
    if (nonElectronicProducts.length === 0) return;
    const confirmed = window.confirm(
      a.cleanupConfirm.replace("{count}", String(nonElectronicProducts.length)),
    );
    if (!confirmed) return;

    setActionError("");
    const results = await Promise.allSettled(
      nonElectronicProducts.map((product) => onDeleteProduct(product.id)),
    );
    const failed = results.filter((result) => result.status === "rejected");
    if (failed.length > 0) {
      const reason = failed[0].reason;
      setActionError(
        a.cleanupError
          .replace("{failed}", String(failed.length))
          .replace("{total}", String(nonElectronicProducts.length))
          .replace("{error}", reason?.message || String(reason)),
      );
    }
  }

  async function handleOrderStatus(orderId, status) {
    setActionError("");
    try {
      await updateDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() });
    } catch (error) {
      setActionError(a.statusUpdateError.replace("{error}", error.message));
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      setActionError(a.logoutError.replace("{error}", error.message));
    }
  }

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span className="logo-icon"><BarChart3 size={21} /></span><b>{a.dashboard}</b></div>
        <nav className="admin-nav" aria-label={a.adminNavLabel}>
          {SECTIONS.map(({ id, labelKey, icon: Icon }) => (
            <button key={id} className={section === id ? "active" : ""} onClick={() => setSection(id)}>
              <Icon size={18} />{a[labelKey]}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span title={user?.email}>{user?.email}</span>
          <button className="admin-nav-logout" onClick={handleLogout}><LogOut size={16} /> {a.logout}</button>
        </div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-workspace-header">
          <div><span className="eyebrow">TECH-ZONE</span><h1>{a[SECTIONS.find((item) => item.id === section)?.labelKey]}</h1></div>
          <div className="admin-header-actions">
            <label className="admin-language-picker">
              <span className="sr-only">{a.language}</span>
              <select value={lang} onChange={(event) => setLang(event.target.value)} aria-label={a.language}>
                <option value="ru">RU</option>
                <option value="ky">KY</option>
                <option value="en">EN</option>
              </select>
            </label>
            <span className="admin-role-badge">{a.administrator}</span>
          </div>
        </header>
        {actionError && <p className="admin-error">{actionError}</p>}

        {section === "overview" && (
          <>
            <div className="admin-stat-grid">
              <article className="admin-stat-card"><span><Package size={19} /></span><small>{a.electronicProducts}</small><strong>{inventoryProducts.filter(isElectronicProduct).length}</strong></article>
              <article className="admin-stat-card"><span><ClipboardList size={19} /></span><small>{a.orders}</small><strong>{orders.length}</strong></article>
              <article className="admin-stat-card"><span><Users size={19} /></span><small>{a.users}</small><strong>{users.length}</strong></article>
              <article className="admin-stat-card"><span><CircleDollarSign size={19} /></span><small>{a.orderTotal}</small><strong>{revenue.toLocaleString({ ru: "ru-RU", ky: "ky-KG", en: "en-US" }[lang])} USD</strong></article>
            </div>
            <section className="admin-card">
              <h2><BarChart3 size={18} /> {a.latestOrders}</h2>
              <OrderTable orders={orders.slice(0, 5)} onStatusChange={handleOrderStatus} a={a} lang={lang} />
            </section>
          </>
        )}

        {section === "products" && (
          <>
            <section className="admin-card">
              <div className="admin-products-heading">
                <h2><Boxes size={18} /> {a.allProducts} ({inventoryProducts.length})</h2>
                <div className="admin-products-actions">
                  <button
                    className="primary-button admin-add-product-button"
                    onClick={() => {
                      setFormError("");
                      setSuccessMessage("");
                      setAddProductOpen(true);
                    }}
                  >
                    <Plus size={16} />{a.addProduct}
                  </button>
                  {nonElectronicProducts.length > 0 && (
                    <button className="admin-cleanup-button" onClick={handleCleanupNonElectronic}>
                      {a.cleanupNonElectronic.replace("{count}", String(nonElectronicProducts.length))}
                    </button>
                  )}
                </div>
              </div>
              <label className="search-box admin-product-search">
                <input
                  type="search"
                  placeholder={a.searchProducts}
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                />
              </label>
              {visibleProducts.length === 0 ? <p className="admin-muted">{a.noProductsFound}</p> : (
                <div className="admin-product-list">
                  {visibleProducts.map((product) => {
                    const isElectronic = isElectronicProduct(product);
                    return (
                      <div className={`admin-product-item ${!isElectronic ? "admin-product-item-outside" : ""}`} key={`${product.isCustom ? "firebase" : "catalog"}-${product.id}`}>
                        <img src={product.thumbnail} alt={product.title} />
                        <div className="admin-product-info">
                          <b>{product.title}</b>
                          <span>{product.price} USD · {product.category || a.noCategory}</span>
                          <small>{product.isCustom ? a.sourceFirebase : a.sourceCatalog}</small>
                        </div>
                        {!isElectronic && <span className="admin-product-warning">{a.outsideElectronics}</span>}
                        {product.isCustom && (
                          <button
                            className="admin-delete-btn"
                            onClick={() => handleDeleteProduct(product.id)}
                            aria-label={a.deleteProduct.replace("{title}", product.title)}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
            {successMessage && <p className="admin-success">{successMessage}</p>}
          </>
        )}

        {section === "orders" && <section className="admin-card"><h2><ClipboardList size={18} /> {a.allOrders} ({orders.length})</h2><OrderTable orders={orders} onStatusChange={handleOrderStatus} a={a} lang={lang} /></section>}
        {section === "users" && (
          <section className="admin-card">
            <h2><Users size={18} /> {a.users} ({users.length})</h2>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{a.name}</th><th>{a.email}</th><th>{a.registrationDate}</th><th>{a.uid}</th></tr></thead>
              <tbody>{users.map((item) => <tr key={item.id}><td>{item.displayName || "—"}</td><td>{item.email}</td><td>{formatDate(item.createdAt, lang)}</td><td><code>{item.uid || item.id}</code></td></tr>)}</tbody>
            </table></div>
            {users.length === 0 && <p className="admin-muted">{a.noUsers}</p>}
          </section>
        )}
      </section>
      {addProductOpen && (
        <div
          className="checkout-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) setAddProductOpen(false);
          }}
        >
          <section
            className="checkout-modal admin-add-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-add-product-title"
          >
            <header className="checkout-modal-header">
              <div>
                <span className="eyebrow">{a.products}</span>
                <h2 id="admin-add-product-title">{a.addProduct}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setAddProductOpen(false)}
                aria-label={a.close}
                disabled={busy}
              >
                <X size={18} />
              </button>
            </header>
            <form className="admin-form admin-add-product-form" onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <label className="admin-label full-width">{a.title}
                  <input required name="title" value={form.title} onChange={handleChange} />
                </label>
                <label className="admin-label full-width">{a.description}
                  <textarea name="description" rows={3} value={form.description} onChange={handleChange} />
                </label>
                <label className="admin-label">{a.price}
                  <input required name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleChange} />
                </label>
                <label className="admin-label">{a.category}
                  <select name="category" value={form.category} onChange={handleChange}>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{a.categories[item.labelKey]}</option>)}
                  </select>
                </label>
                <label className="admin-label full-width">{a.image}
                  <span className="admin-file-picker"><ImagePlus size={17} /> {a.chooseImage}
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                  </span>
                </label>
                <label className="admin-label">{a.discount}
                  <input name="discountPercentage" type="number" min="0" max="100" value={form.discountPercentage} onChange={handleChange} />
                </label>
                <label className="admin-label">{a.stock}
                  <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} />
                </label>
                <label className="admin-label">{a.rating}
                  <input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={handleChange} />
                </label>
                {form.thumbnail && <div className="admin-img-preview"><img src={form.thumbnail} alt={a.imagePreview} /></div>}
              </div>
              {formError && <p className="admin-error">{formError}</p>}
              <button type="submit" className="primary-button admin-submit" disabled={busy}>
                <Plus size={16} />{busy ? a.saving : a.save}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function OrderTable({ orders, onStatusChange, a, lang }) {
  if (orders.length === 0) return <p className="admin-muted">{a.noOrders}</p>;
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>{a.order}</th><th>{a.customerName}</th><th>{a.address}</th><th>{a.phone}</th><th>{a.payment}</th><th>{a.contents}</th><th>{a.amount}</th><th>{a.date}</th><th>{a.status}</th></tr></thead>
        <tbody>{orders.map((order) => (
          <tr key={order.id}>
            <td><code>{order.id.slice(0, 8)}</code></td>
            <td>{[order.firstName, order.lastName].filter(Boolean).join(" ") || order.email || order.userId}</td>
            <td>{order.address || "—"}</td>
            <td>{order.phone || "—"}</td>
            <td>{order.paymentMethod === "cash" ? a.cashPayment : order.paymentMethod || "—"}</td>
            <td>{(order.items || []).map((item) => `${item.title} × ${item.quantity}`).join(", ") || "—"}</td>
            <td>{Number(order.total || 0).toLocaleString({ ru: "ru-RU", ky: "ky-KG", en: "en-US" }[lang])} USD</td>
            <td>{formatDate(order.createdAt, lang)}</td>
            <td><select aria-label={a.statusLabel.replace("{id}", order.id)} value={order.status || "new"} onChange={(event) => onStatusChange(order.id, event.target.value)}>
              {ORDER_STATUSES.map((status) => <option key={status} value={status}>{a[status]}</option>)}
            </select></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
