import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpDown,
  Headphones,
  Link2,
  Heart,
  Laptop,
  RotateCcw,
  Search,
  Smartphone,
  Star,
  Watch,
  X,
  Zap,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";
import useShop from "../hooks/useShop";
import { formatPrice, getCategoryLabel } from "../utils/products";

export default function Catalog({ favoritesOnly = false }) {
  const {
    addToCart,
    category,
    cart,
    error,
    favorites,
    loading,
    products,
    search,
    setCategory,
    setSearch,
    t,
    toggleFavorite,
  } = useShop();
  const [sort, setSort] = useState("default");
  const [linkCopied, setLinkCopied] = useState(false);
  // Открытый товар хранится в адресе (?product=ID), поэтому ссылкой на товар можно поделиться
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProductId = searchParams.get("product");
  const selectedProduct = selectedProductId
    ? products.find((product) => String(product.id) === selectedProductId) || null
    : null;

  function setSelectedProduct(product) {
    setLinkCopied(false);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (product) next.set("product", String(product.id));
      else next.delete("product");
      return next;
    });
  }

  async function copyProductLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
    } catch {
      setLinkCopied(false);
    }
  }

  useEffect(() => {
    if (favoritesOnly) setCategory("all");
  }, [favoritesOnly, setCategory]);

  const categories = [
    { id: "all", label: t.catAll, icon: Zap },
    { id: "smartphones", label: t.catSmartphones, icon: Smartphone },
    { id: "laptops", label: t.catLaptops, icon: Laptop },
    { id: "tablets", label: t.catTablets, icon: Smartphone },
    { id: "mobile-accessories", label: t.catAccessories, icon: Headphones },
    { id: "watches", label: t.catWatches, icon: Watch },
  ];

  const filteredProducts = useMemo(() => {
    let result = products;
    if (favoritesOnly) result = result.filter((product) => favorites.includes(product.id));
    if (category === "watches") {
      result = result.filter((product) => ["mens-watches", "womens-watches"].includes(product.category));
    } else if (category !== "all") result = result.filter((product) => product.category === category);
    const query = search.trim().toLowerCase();
    if (query) result = result.filter((product) => `${product.title} ${product.description}`.toLowerCase().includes(query));
    const sorters = {
      "price-asc": (left, right) => left.price - right.price,
      "price-desc": (left, right) => right.price - left.price,
      rating: (left, right) => (Number(right.rating) || 0) - (Number(left.rating) || 0),
      discount: (left, right) => (Number(right.discountPercentage) || 0) - (Number(left.discountPercentage) || 0),
    };
    return sorters[sort] ? [...result].sort(sorters[sort]) : result;
  }, [products, favorites, favoritesOnly, category, search, sort]);

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setSort("default");
  }

  return (
    <section className="section" id="catalog">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t.catalogEyebrow}</span>
          <h2>{favoritesOnly ? t.favoritesLabel : <>{t.catalogTitle1} <span>{t.catalogTitleAccent}</span></>}</h2>
          <p>{favoritesOnly ? t.favoritesNote : t.catalogDesc}</p>
        </div>
        <div className="product-count">
          {favoritesOnly ? `${t.favoritesLabel} ${filteredProducts.length}` : `${t.foundLabel} ${filteredProducts.length}`}
        </div>
      </div>

      <div className="catalog-toolbar">
        <label className="search-box">
          <Search size={19} />
          <input type="text" placeholder={t.searchPlaceholder} value={search} onChange={(event) => setSearch(event.target.value)} />
          {search && <button onClick={() => setSearch("")} aria-label="Очистить поиск"><X size={17} /></button>}
        </label>
        <label className="catalog-sort">
          <ArrowUpDown size={16} />
          <span className="sr-only">{t.sortLabel}</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label={t.sortLabel}>
            <option value="default">{t.sortDefault}</option>
            <option value="price-asc">{t.sortPriceAsc}</option>
            <option value="price-desc">{t.sortPriceDesc}</option>
            <option value="rating">{t.sortRating}</option>
            <option value="discount">{t.sortDiscount}</option>
          </select>
        </label>
        {!favoritesOnly && (
          <div className="category-list">
            {categories.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`category-chip ${category === id ? "active" : ""}`} onClick={() => setCategory(id)}>
                <Icon size={15} />{label}
              </button>
            ))}
          </div>
        )}
      </div>

      {favoritesOnly && <div className="catalog-note"><Heart size={15} fill="currentColor" /> {t.favoritesNote}</div>}
      {loading && <div className="product-grid">{Array.from({ length: 8 }, (_, index) => <div className="skeleton" key={index} />)}</div>}
      {!loading && error && (
        <div className="empty-state">
          <h3>{t.errorTitle}</h3><p>{error}</p>
          <button className="primary-button" onClick={() => window.location.reload()}><RotateCcw size={16} /> {t.errorRetry}</button>
        </div>
      )}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="empty-state">
          <Search size={35} /><h3>{t.emptyTitle}</h3><p>{t.emptyDesc}</p>
          <button className="secondary-button" onClick={resetFilters}>{t.resetFilters}</button>
        </div>
      )}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="product-grid">
          {filteredProducts.map((product) => {
            const isFavorite = favorites.includes(product.id);
            const cartItem = cart.find((item) => item.id === product.id);
            return (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  {product.discountPercentage > 0 && <span className="discount">-{Math.round(product.discountPercentage)}%</span>}
                  <button className={`favorite-toggle ${isFavorite ? "selected" : ""}`} onClick={(event) => { event.stopPropagation(); toggleFavorite(product.id); }} aria-label="Добавить в избранное" title="Избранное">
                    <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                  <img src={product.thumbnail} alt={product.title} loading="lazy" onClick={() => setSelectedProduct(product)} />
                </div>
                <div className="product-info" onClick={() => setSelectedProduct(product)}>
                  <span className="product-category">{getCategoryLabel(product.category, t)}</span>
                  <h3>{product.title}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="rating">
                    <Star size={14} fill="currentColor" /><span>{Number(product.rating || 0).toFixed(1)}</span>
                    <span>·</span><span>{t.inStockLabel} {product.stock}</span>
                  </div>
                  <div className="product-bottom">
                    <div className="product-price">
                      <strong>{formatPrice(product.price)}</strong>
                      {product.discountPercentage > 0 && (
                        <s className="product-old-price">
                          {formatPrice(product.price / (1 - product.discountPercentage / 100))}
                        </s>
                      )}
                    </div>
                    <button
                      className={`add-button ${cartItem ? "in-cart" : ""}`}
                      onClick={(event) => { event.stopPropagation(); addToCart(product); }}
                      disabled={product.stock <= 0}
                      aria-label={cartItem ? `${product.title}: ${cartItem.quantity} ${t.inCartLabel}` : `${t.addToCart}: ${product.title}`}
                    >
                      <ShoppingCart size={15} />{cartItem ? `${t.inCartLabel} · ${cartItem.quantity}` : t.addToCart}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {selectedProduct && (
        <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal" onClick={(event) => event.stopPropagation()}>
            <button className="product-modal-close" onClick={() => setSelectedProduct(null)} aria-label="Закрыть">
              <X size={18} />
            </button>
            <div className="product-modal-gallery">
              <img src={selectedProduct.thumbnail} alt={selectedProduct.title} />
            </div>
            <div className="product-modal-content">
              <span className="product-category">{getCategoryLabel(selectedProduct.category, t)}</span>
              <h3>{selectedProduct.title}</h3>
              <div className="product-modal-meta">
                <div className="rating">
                  <Star size={14} fill="currentColor" /><span>{Number(selectedProduct.rating || 0).toFixed(1)}</span>
                </div>
                <span>{t.inStockLabel} {selectedProduct.stock}</span>
              </div>
              <div className="product-modal-price-row">
                <strong>{formatPrice(selectedProduct.price)}</strong>
                {selectedProduct.discountPercentage > 0 && (
                  <s>{formatPrice(selectedProduct.price / (1 - selectedProduct.discountPercentage / 100))}</s>
                )}
              </div>
              <p className="product-modal-description">{selectedProduct.description}</p>
              <div className="product-modal-features">
                <div>
                  <span>{t.modalCondition}</span>
                  <strong>{selectedProduct.condition || t.modalConditionNew}</strong>
                </div>
                <div>
                  <span>{t.modalBrand}</span>
                  <strong>{selectedProduct.brand || "Tech Zone"}</strong>
                </div>
                <div>
                  <span>{t.modalWarranty}</span>
                  <strong>{selectedProduct.warranty || t.modalWarrantyDefault}</strong>
                </div>
              </div>
              <div className="product-modal-actions">
                <button className="secondary-button" onClick={copyProductLink}>
                  <Link2 size={16} />
                  {linkCopied ? t.linkCopied : t.copyLink}
                </button>
                <button className="secondary-button" onClick={() => toggleFavorite(selectedProduct.id)}>
                  <Heart size={16} fill={favorites.includes(selectedProduct.id) ? "currentColor" : "none"} />
                  {favorites.includes(selectedProduct.id) ? t.inFavorites : t.addToFavorites}
                </button>
                <button className="primary-button" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                  {t.addToCart}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {!loading && !error && <p className="catalog-note">{t.catalogNote}</p>}
    </section>
  );
}
