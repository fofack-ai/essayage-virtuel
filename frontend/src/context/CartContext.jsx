import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { api, getImageUrl } from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

const normalizeItems = (backendItems = []) => {
  return backendItems.map((item) => ({
    id: item.id,
    cartItemId: item.id,
    productId: item.productId,
    name: item.productName,
    image: getImageUrl(item.productImage),
    size: item.size,
    sizeStock: item.sizeStock || item.stock || item.availableStock || null,
    color: item.color,
    qty: item.quantity,
    price: item.price,
    subtotal: item.subtotal,
  }));
};

  const loadCart = async () => {
    // Pas de barrière sur le token : optionalAuth côté serveur identifie le
    // propriétaire du panier — compte via le Bearer, invité via le cookie
    // guestId. Filtrer ici rendait le panier invité invisible alors même
    // qu'il existait en base.
    try {
      setLoadingCart(true);

      const response = await api.get("/cart");

      setItems(normalizeItems(response.data.items));
      setTotal(response.data.total);
      setCount(response.data.count);
    } catch (error) {
        console.error("Erreur chargement panier :", error.message);

        if (
          error.message.includes("Token") ||
          error.message.includes("invalide") ||
          error.message.includes("manquant")
        ) {
          localStorage.removeItem("tryon_token");
          localStorage.removeItem("tryon_user");
          setItems([]);
          setTotal(0);
          setCount(0);
        }
      } finally {
        setLoadingCart(false);
      }
    };

  useEffect(() => {
    loadCart();
  }, []);

  // Après une connexion, AuthContext fusionne le panier invité côté serveur
  // puis émet cet événement. Sans lui, le badge du panier resterait figé sur
  // l'ancien état jusqu'au prochain rechargement de page.
  useEffect(() => {
    const refresh = () => loadCart();
    window.addEventListener('cart:refresh', refresh);
    return () => window.removeEventListener('cart:refresh', refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addItem = async (product) => {
    // Aucun compte requis : le client essaie, remplit son panier, et ne crée
    // un compte qu'au moment de payer. Le panier constitué avant la connexion
    // est rapatrié par /cart/merge (voir AuthContext).
    const payload = {
      productId: product.id || product.productId || null,
      productName: product.name,
      productImage: product.image || product.productImage || null,
      size: product.size || null,
      color: product.color || null,
      quantity: product.qty || 1,
      price: product.price,
    };

    const response = await api.post("/cart/add", payload);

    setItems(normalizeItems(response.data.items));
    setTotal(response.data.total);
    setCount(response.data.count);
  };

  const updateQty = async (id, size, color, qty) => {
    const item = items.find(
      (i) =>
        i.id === id ||
        (i.productId === id && i.size === size && i.color === color)
    );

    if (!item) return;

    const response = await api.put(
      `/cart/update/${item.cartItemId}`,
      {
        quantity: qty,
      }
    );

    setItems(normalizeItems(response.data.items));
    setTotal(response.data.total);
    setCount(response.data.count);
  };

  const removeItem = async (id, size, color) => {
    const item = items.find(
      (i) =>
        i.id === id ||
        (i.productId === id && i.size === size && i.color === color)
    );

    if (!item) return;

    const response = await api.delete(
      `/cart/remove/${item.cartItemId}`
    );

    setItems(normalizeItems(response.data.items));
    setTotal(response.data.total);
    setCount(response.data.count);
  };

  const clearCart = async () => {
    const response = await api.delete("/cart/clear");

    setItems(normalizeItems(response.data.items));
    setTotal(response.data.total);
    setCount(response.data.count);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        loadCart,
        total,
        count,
        loadingCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);