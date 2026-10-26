import { Route, Routes } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import ShopProvider from "./context/ShopProvider";
import AdminLayout from "./layouts/AdminLayout";
import StoreLayout from "./layouts/StoreLayout";
import AdminPage from "./pages/AdminPage";
import AccountPage from "./pages/AccountPage";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import CatalogPage from "./pages/CatalogPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<HomePage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="favorites" element={<CatalogPage favoritesOnly />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </ShopProvider>
    </AuthProvider>
  );
}
