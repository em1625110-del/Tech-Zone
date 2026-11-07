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

const PRICE_CORRECTIONS = new Map([
  ["apple 13 pro", 35000],
  ["apple 11", 15000],
  ["airpods", 8000],
  ["apple wotch", 25000],
  ["ipad", 30000],
  ["hp z-book", 65000],
]);

export function correctProductPrice(product) {
  const correctedPrice = PRICE_CORRECTIONS.get(product.title?.trim().toLowerCase());
  if (correctedPrice === undefined) return product;

  return { ...product, price: correctedPrice, discountPercentage: 0 };
}

export function formatPrice(price) {
  return (
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(price) + " сом"
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
