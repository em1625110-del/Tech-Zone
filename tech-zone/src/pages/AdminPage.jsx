import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AdminPanel from "../components/AdminPanel";
import useShop from "../hooks/useShop";

export default function AdminPage() {
  const { authLoading, isAdmin, user } = useAuth();
  const { addProduct, deleteProduct, inventoryProducts, t } = useShop();

  if (authLoading) return <main className="section"><p>{t.admin.checkPermissions}</p></main>;
  if (!user || !isAdmin) return <Navigate to="/auth" replace />;

  return (
    <AdminPanel
      onAddProduct={addProduct}
      onDeleteProduct={deleteProduct}
      inventoryProducts={inventoryProducts}
    />
  );
}
