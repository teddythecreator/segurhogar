import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isDropshippingOnly: () => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.producto.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.producto.id === product.id
                  ? { ...item, cantidad: item.cantidad + quantity }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { producto: product, cantidad: quantity }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.producto.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.producto.id === productId ? { ...item, cantidad: quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.producto.precio_rebajado ?? item.producto.precio;
          return total + price * item.cantidad;
        }, 0);
      },

      isDropshippingOnly: () => {
        return get().items.every((item) => item.producto.tipo === 'dropshipping');
      },
    }),
    {
      name: 'segurhogar-cart',
    }
  )
);
