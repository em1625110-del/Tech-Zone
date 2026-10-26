import { useContext } from "react";
import ShopContext from "../context/ShopContext";

export default function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within ShopProvider");
  return context;
}
