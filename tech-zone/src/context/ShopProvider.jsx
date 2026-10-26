import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import ShopContext from "./ShopContext";
import translations from "../data/translations";
import { db } from "../firebase";
import useAuth from "../hooks/useAuth";
import { isElectronicProduct } from "../utils/products";

export default function ShopProvider({ children }) {
  const { user } = useAuth();
  const [cloudProducts, setCloudProducts] = useState([]);
  const [loading, setLoading] = useState(Boolean(db));
  const [error, setError] = useState(
    db ? "" : "Firebase не настроен. Проверьте переменные окружения.",
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("ru");
  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        setError("");
        setLoading(false);
        setCloudProducts(
          snapshot.docs.map((item) => ({ ...item.data(), id: item.id, isCustom: true })),
        );
      },
      (snapshotError) => {
        setLoading(false);
        setError(`Не удалось загрузить товары Firebase: ${snapshotError.message}`);
      },
    );
  }, []);

  const products = useMemo(
    () => cloudProducts.filter(isElectronicProduct),
    [cloudProducts],
  );
  const inventoryProducts = cloudProducts;

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...current, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(productId, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + amount } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId) {
    setCart((current) => current.filter((item) => item.id !== productId));
  }

  function toggleFavorite(productId) {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  const addProduct = useCallback(async (product) => {
    if (!db) throw new Error("Firebase не настроен. Проверьте .env.local.");
    await addDoc(collection(db, "products"), {
      ...product,
      createdAt: serverTimestamp(),
      createdBy: user?.uid,
    });
  }, [user]);

  async function deleteProduct(productId) {
    if (!db) throw new Error("Firebase не настроен. Проверьте .env.local.");
    await deleteDoc(doc(db, "products", String(productId)));
  }

  const createOrder = useCallback(async (customer, invalidPhoneMessage, invalidDetailsMessage) => {
    if (!db || !user) throw new Error("Чтобы оформить заказ, войдите в аккаунт.");
    const firstName = String(customer?.firstName || "").trim();
    const lastName = String(customer?.lastName || "").trim();
    const address = String(customer?.address || "").trim();
    const normalizedPhone = String(customer?.phone || "").trim();
    const phoneDigits = normalizedPhone.replace(/\D/g, "");
    if (
      !firstName ||
      !lastName ||
      address.length < 5 ||
      firstName.length > 100 ||
      lastName.length > 100 ||
      address.length > 500
    ) {
      throw new Error(invalidDetailsMessage || "Проверьте имя, фамилию и адрес доставки.");
    }
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      throw new Error(invalidPhoneMessage || "Укажите корректный номер телефона.");
    }
    const items = cart.map(({ id, title, price, quantity }) => ({
      productId: String(id),
      title,
      price,
      quantity,
    }));
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await addDoc(collection(db, "orders"), {
      userId: user.uid,
      email: user.email,
      firstName,
      lastName,
      address,
      phone: normalizedPhone,
      paymentMethod: "cash",
      items,
      total,
      status: "new",
      createdAt: serverTimestamp(),
    });
    setCart([]);
  }, [cart, user]);

  const value = useMemo(
    () => ({
      products,
      inventoryProducts,
      loading,
      error,
      search,
      setSearch,
      category,
      setCategory,
      cart,
      favorites,
      dark,
      setDark,
      lang,
      setLang,
      t: translations[lang],
      customProducts: cloudProducts,
      addToCart,
      changeQuantity,
      removeFromCart,
      toggleFavorite,
      addProduct,
      deleteProduct,
      createOrder,
    }),
    [products, inventoryProducts, cloudProducts, loading, error, search, category, cart, favorites, dark, lang, addProduct, createOrder],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
