export const ELECTRONIC_CATEGORIES = new Set([
  "smartphones",
  "laptops",
  "tablets",
  "mobile-accessories",
  "mens-watches",
  "womens-watches",
]);

export function isElectronicProduct(product) {
  return ELECTRONIC_CATEGORIES.has(product.category);
}

export function formatPrice(price) {
  return (
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
      Math.round(price * 87),
    ) + " сом"
  );
}

export function getCategoryLabel(category, t) {
  const labels = {
    smartphones: t.catSmartphones,
    laptops: t.catLaptops,
    tablets: t.catTablets,
    "mobile-accessories": t.catAccessories,
    "mens-watches": t.catWatches,
    "womens-watches": t.catWatches,
  };
  return labels[category] || t.catAll;
}

export function isGamingProduct(product) {
  const text = `${product.title} ${product.category}`.toLowerCase();
  return /gaming|gamepad|controller|console|playstation|xbox|nintendo/.test(text);
}
