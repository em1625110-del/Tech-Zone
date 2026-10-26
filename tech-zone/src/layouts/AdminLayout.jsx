import { Outlet } from "react-router-dom";
import useShop from "../hooks/useShop";

export default function AdminLayout() {
  const { dark } = useShop();

  return (
    <div className={`app admin-app ${dark ? "dark" : ""}`}>
      <Outlet />
    </div>
  );
}
