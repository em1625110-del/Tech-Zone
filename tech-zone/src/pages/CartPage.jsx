import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import useShop from "../hooks/useShop";
import useAuth from "../hooks/useAuth";
import { formatPrice } from "../utils/products";

const EMPTY_CUSTOMER = {
  firstName: "",
  lastName: "",
  address: "",
  phone: "",
};

export default function CartPage() {
  const { cart, changeQuantity, createOrder, removeFromCart, t } = useShop();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    if (!checkoutOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape" && !submitting) setCheckoutOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [checkoutOpen, submitting]);

  function handleCustomerChange(event) {
    setCustomer((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleCheckout(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const phoneDigits = customer.phone.replace(/\D/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      setError(t.phoneInvalid);
      return;
    }

    setSubmitting(true);
    try {
      await createOrder(customer, t.phoneInvalid, t.customerDetailsInvalid);
      setCustomer(EMPTY_CUSTOMER);
      setCheckoutOpen(false);
      setSuccess(t.orderSuccess);
    } catch (checkoutError) {
      setError(checkoutError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="section cart-page">
      <div className="cart-panel">
        <div className="cart-panel-heading"><h2>{t.cartTitle}</h2></div>
        {cart.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={35} />
            <p>{t.cartEmpty}</p>
            <Link className="primary-button" to="/catalog">{t.cartCta}</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.thumbnail} alt={item.title} />
                  <div className="cart-item-info">
                    <b>{item.title}</b><span>{formatPrice(item.price)}</span>
                    <div className="quantity-controls">
                      <button onClick={() => changeQuantity(item.id, -1)} aria-label="Уменьшить количество"><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => changeQuantity(item.id, 1)} aria-label="Увеличить количество"><Plus size={14} /></button>
                    </div>
                  </div>
                  <button className="remove-button" onClick={() => removeFromCart(item.id)} aria-label="Удалить товар"><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
            <div className="cart-total"><span>{t.cartTotal}</span><strong>{formatPrice(cartTotal)}</strong></div>
            {error && <p className="admin-error">{error}</p>}
            {success && <p className="admin-success">{success}</p>}
            {!user && <p className="auth-note">Для оформления заказа <Link to="/auth">войдите или зарегистрируйтесь</Link>.</p>}
            <button
              type="button"
              className="primary-button checkout-button"
              onClick={() => {
                setError("");
                setCheckoutOpen(true);
              }}
              disabled={!user}
            >
              {t.cartCheckout} <ArrowRight size={17} />
            </button>
          </>
        )}
      </div>

      {checkoutOpen && (
        <div
          className="checkout-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) setCheckoutOpen(false);
          }}
        >
          <section
            className="checkout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-modal-title"
          >
            <header className="checkout-modal-header">
              <div>
                <span className="eyebrow">{t.checkoutDetails}</span>
                <h2 id="checkout-modal-title">{t.cartCheckout}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setCheckoutOpen(false)}
                aria-label={t.close}
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </header>
            <form className="checkout-modal-form" onSubmit={handleCheckout} noValidate>
              <div className="checkout-customer-grid">
                <label className="admin-label">
                  {t.customerFirstName}
                  <input
                    required
                    autoComplete="given-name"
                    name="firstName"
                    value={customer.firstName}
                    onChange={handleCustomerChange}
                  />
                </label>
                <label className="admin-label">
                  {t.customerLastName}
                  <input
                    required
                    autoComplete="family-name"
                    name="lastName"
                    value={customer.lastName}
                    onChange={handleCustomerChange}
                  />
                </label>
              </div>
              <label className="admin-label">
                {t.customerAddress}
                <textarea
                  required
                  autoComplete="street-address"
                  name="address"
                  rows={2}
                  value={customer.address}
                  onChange={handleCustomerChange}
                />
              </label>
              <label className="admin-label">
                {t.checkoutPhone}
                <input
                  required
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  title={t.checkoutPhoneHint}
                  placeholder={t.checkoutPhonePlaceholder}
                  value={customer.phone}
                  onChange={handleCustomerChange}
                />
              </label>
              <div className="checkout-payment">
                <span>{t.paymentMethod}</span>
                <strong>{t.cashPayment}</strong>
              </div>
              {error && <p className="admin-error">{error}</p>}
              <div className="checkout-modal-total">
                <span>{t.cartTotal}</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
              <button type="submit" className="primary-button checkout-submit" disabled={submitting}>
                {submitting ? t.checkoutSubmitting : t.confirmOrder}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
